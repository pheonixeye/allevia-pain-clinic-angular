import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslationService } from '../../services/translation.service';
import { PocketBaseService, Patient, PatientDocument } from '../../services/pocketbase.service';

interface Visit {
    id: string;
    patient_id: string;
    visit_date: string;
}

const DOCUMENT_TYPE_NAME = 'Prescription';
const DOCUMENT_TYPE_ID_KEY = 'allevia_document_type_id';

@Component({
    selector: 'app-patient-portal',
    templateUrl: './patient-portal.component.html',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPortalComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
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

    // Document fetching
    private documentTypeId: string | null = null;
    expandedVisitId = signal<string | null>(null);
    visitDocuments = signal<PatientDocument[]>([]);
    isLoadingDocuments = signal(false);

    private html5QrCode: Html5Qrcode | null = null;

    async ngOnInit() {
        await this.loadDocumentTypeId();

        // Check if patientId is in the route
        const patientIdFromRoute = this.route.snapshot.paramMap.get('patientId');
        if (patientIdFromRoute) {
            // Load patient data directly without scanning
            this.scannedPatientId.set(patientIdFromRoute);
            this.currentPage.set(1);
            await this.fetchPatientDetails(patientIdFromRoute);
            await this.fetchVisits(patientIdFromRoute, 1);
        }
    }

    /**
     * Load document type ID from localStorage or fetch from PocketBase
     */
    private async loadDocumentTypeId() {
        // Check localStorage first
        const storedId = localStorage.getItem(DOCUMENT_TYPE_ID_KEY);
        if (storedId) {
            this.documentTypeId = storedId;
            console.log('Document type ID loaded from localStorage:', storedId);
            return;
        }

        // Fetch from PocketBase
        try {
            const documentType = await this.pocketbaseService.getDocumentTypeByName(DOCUMENT_TYPE_NAME);
            this.documentTypeId = documentType.id;
            localStorage.setItem(DOCUMENT_TYPE_ID_KEY, documentType.id);
            console.log('Document type ID fetched and cached:', documentType.id);
        } catch (error) {
            console.error('Failed to fetch document type:', error);
            // Continue without document type ID - documents won't be fetchable
        }
    }

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

        // Navigate to URL with patient ID
        const lang = this.currentLang();
        this.router.navigate([`/${lang}/patient-portal`, patientId]);
    }

    async fetchPatientDetails(patientId: string) {
        this.isLoading.set(true);
        try {
            const patient = await this.pocketbaseService.getPatient(patientId);
            this.patient.set(patient);
        } catch (error: any) {
            console.error('Fetch patient error:', error);
            this.errorMessage.set('Could not find patient details. Please check the QR code.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async fetchVisits(patientId: string, page: number) {
        this.isLoading.set(true);

        try {
            const result = await this.pocketbaseService.getPatientVisits(patientId, page, this.perPage);

            this.visits.set(result.items);
            this.totalPages.set(result.totalPages);
            this.currentPage.set(page);

            if (result.items.length === 0 && page === 1) {
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

    /**
     * Toggle visit expansion and fetch documents if expanding
     */
    async toggleVisit(visit: Visit) {
        if (this.expandedVisitId() === visit.id) {
            // Collapse
            this.expandedVisitId.set(null);
            this.visitDocuments.set([]);
            return;
        }

        // Expand and fetch documents
        this.expandedVisitId.set(visit.id);
        this.visitDocuments.set([]);

        if (!this.documentTypeId) {
            console.warn('Document type ID not available');
            return;
        }

        this.isLoadingDocuments.set(true);

        try {
            const documents = await this.pocketbaseService.getPatientDocuments(
                visit.patient_id,
                visit.id,
                this.documentTypeId
            );
            this.visitDocuments.set(documents);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            this.visitDocuments.set([]);
        } finally {
            this.isLoadingDocuments.set(false);
        }
    }

    /**
     * Get document file URL
     */
    getDocumentUrl(doc: PatientDocument): string {
        const pb = this.pocketbaseService.getClient();
        return pb.files.getURL(doc, doc.document, { thumb: '100x100' });
    }

    /**
     * Get full document URL for viewing/downloading
     */
    getFullDocumentUrl(doc: PatientDocument): string {
        const pb = this.pocketbaseService.getClient();
        return pb.files.getURL(doc, doc.document);
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
        this.expandedVisitId.set(null);
        this.visitDocuments.set([]);

        // Navigate back to patient portal without ID
        const lang = this.currentLang();
        this.router.navigate([`/${lang}/patient-portal`]);
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
