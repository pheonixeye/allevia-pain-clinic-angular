import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslationService } from '../../services/translation.service';
import { PocketBaseService, Patient } from '../../services/pocketbase.service';

interface Visit {
    id: string;
    patient_id: string;
    visit_date: string;
}

@Component({
    selector: 'app-patient-portal',
    templateUrl: './patient-portal.component.html',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPortalComponent implements OnDestroy {
    translationService = inject(TranslationService);
    pocketbaseService = inject(PocketBaseService);

    translations = this.translationService.translations;
    currentLang = this.translationService.currentLang;

    // UI States
    isScanning = signal(false);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);
    scannedPatientId = signal<string | null>(null);

    // Data
    patient = signal<Patient | null>(null);
    visits = signal<Visit[]>([]);
    currentPage = signal(1);
    totalPages = signal(1);
    perPage = 5;

    private html5QrCode: Html5Qrcode | null = null;

    async startScanner() {
        this.errorMessage.set(null);
        this.isScanning.set(true);

        try {
            // Get camera devices
            const devices = await Html5Qrcode.getCameras();

            if (!devices || devices.length === 0) {
                throw new Error('No cameras found');
            }

            // Use back camera on mobile, or first available camera
            const cameraId = devices.find(d => d.label.toLowerCase().includes('back'))?.id || devices[0].id;

            this.html5QrCode = new Html5Qrcode('qr-reader');

            await this.html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // QR Code scanned successfully
                    this.onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Scan error - ignore to keep scanning active
                    // Only log if it's not a standard scanning error
                    if (!errorMessage.includes('No MultiFormat Readers')) {
                        console.warn('Scan error:', errorMessage);
                    }
                }
            );
        } catch (error: any) {
            console.error('Scanner error:', error);
            this.errorMessage.set(error?.message || 'Failed to start camera. Please check permissions.');
            // Keep isScanning true so user can retry if it was a temporary glitch, 
            // but in this case (start failed), we might want to reset.
            // However, user requested "component disappears when an error occurs... make it available to scan again"
            // So we keep isScanning true but show error.
            // But if start failed, the scanner UI might not be there. 
            // Let's keep isScanning true so the "Cancel Scan" button is visible and user can try again.
        }
    }

    async stopScanner() {
        if (this.html5QrCode) {
            try {
                if (this.html5QrCode.isScanning) {
                    await this.html5QrCode.stop();
                }
                this.html5QrCode.clear();
            } catch (error) {
                console.error('Error stopping scanner:', error);
            }
            this.html5QrCode = null;
        }
        this.isScanning.set(false);
    }

    async onScanSuccess(patientId: string) {
        // Stop scanner
        await this.stopScanner();

        // Set patient ID and fetch details
        this.scannedPatientId.set(patientId);
        this.currentPage.set(1);

        await this.fetchPatientDetails(patientId);
        await this.fetchVisits(patientId, 1);
    }

    async fetchPatientDetails(patientId: string) {
        this.isLoading.set(true);
        try {
            const patient = await this.pocketbaseService.getPatient(patientId);
            this.patient.set(patient);
        } catch (error: any) {
            console.error('Fetch patient error:', error);
            this.errorMessage.set('Could not find patient details. Please check the QR code.');
            // We still fetch visits even if patient details fail, or maybe stop?
            // User requirement: "display a list of visits by the patient"
            // If patient fetch fails, we might still want to show visits if possible, but likely the ID is wrong.
        } finally {
            this.isLoading.set(false);
        }
    }

    async fetchVisits(patientId: string, page: number) {
        this.isLoading.set(true);
        // Don't clear error message here if it was set by fetchPatientDetails
        // this.errorMessage.set(null); 

        try {
            const result = await this.pocketbaseService.getPatientVisits(patientId, page, this.perPage);

            this.visits.set(result.items);
            this.totalPages.set(result.totalPages);
            this.currentPage.set(page);

            if (result.items.length === 0 && page === 1) {
                // Only show "no visits" if we didn't already have an error
                if (!this.errorMessage()) {
                    this.errorMessage.set('No visits found for this patient.');
                }
            }
        } catch (error: any) {
            console.error('Fetch visits error:', error);
            this.errorMessage.set(error?.message || 'Failed to fetch visits. Please try again.');
            this.visits.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }

    async nextPage() {
        if (this.currentPage() < this.totalPages() && this.scannedPatientId()) {
            await this.fetchVisits(this.scannedPatientId()!, this.currentPage() + 1);
        }
    }

    async previousPage() {
        if (this.currentPage() > 1 && this.scannedPatientId()) {
            await this.fetchVisits(this.scannedPatientId()!, this.currentPage() - 1);
        }
    }

    resetPortal() {
        this.scannedPatientId.set(null);
        this.patient.set(null);
        this.visits.set([]);
        this.currentPage.set(1);
        this.totalPages.set(1);
        this.errorMessage.set(null);
    }

    formatDate(dateString: string): string {
        const lang = this.currentLang();
        const date = new Date(dateString);

        return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    ngOnDestroy() {
        // Clean up scanner on component destroy
        this.stopScanner();
    }
}
