import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslationService } from '../../services/translation.service';
import { PocketBaseService } from '../../services/pocketbase.service';

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

    // Visits data
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
                () => {
                    // Scan error (can ignore these as they happen frequently while scanning)
                }
            );
        } catch (error: any) {
            console.error('Scanner error:', error);
            this.errorMessage.set(error?.message || 'Failed to start camera. Please check permissions.');
            this.isScanning.set(false);
        }
    }

    async stopScanner() {
        if (this.html5QrCode) {
            try {
                await this.html5QrCode.stop();
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

        // Set patient ID and fetch visits
        this.scannedPatientId.set(patientId);
        this.currentPage.set(1);
        await this.fetchVisits(patientId, 1);
    }

    async fetchVisits(patientId: string, page: number) {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        try {
            const result = await this.pocketbaseService.getPatientVisits(patientId, page, this.perPage);

            this.visits.set(result.items);
            this.totalPages.set(result.totalPages);
            this.currentPage.set(page);

            if (result.items.length === 0 && page === 1) {
                this.errorMessage.set('No visits found for this patient.');
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
