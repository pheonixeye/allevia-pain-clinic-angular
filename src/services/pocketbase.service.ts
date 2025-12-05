import { Injectable, signal } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from '../environment';

// Article type matching the existing structure
export type Article = {
    id: string;
    title: {
        en: string;
        ar: string;
    };
    excerpt: {
        en: string;
        ar: string;
    };
    content: {
        en: string;
        ar: string;
    };
    date: {
        en: string;
        ar: string;
    };
};

// PocketBase record type
type ArticleRecord = {
    id: string;
    title_en: string;
    title_ar: string;
    excerpt_en: string;
    excerpt_ar: string;
    content_en: string;
    content_ar: string;
    date: string;
    created: string;
    updated: string;
};

// Online Booking type for the booking form
export type OnlineBooking = {
    id?: string;
    name: string;
    phone: string;
    prefered_date: string;
    message?: string;
    created?: string;
    updated?: string;
};

// Visit type for patient portal
export type Visit = {
    id: string;
    patient_id: string;
    visit_date: string;
    created?: string;
    updated?: string;
};

// Patient type
export type Patient = {
    id: string;
    name: string;
    created?: string;
    updated?: string;
};

export type PaginatedResult<T> = {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: T[];
};

@Injectable({
    providedIn: 'root'
})
export class PocketBaseService {
    private pb: PocketBase;
    private readonly collectionName = 'articles';

    // Signals for reactive state
    isLoading = signal(false);
    error = signal<string | null>(null);

    constructor() {
        this.pb = new PocketBase(environment.pocketbase.url);
        this.pb.autoCancellation(false);
    }

    /**
     * Fetch paginated articles from PocketBase
     */
    async getArticles(page: number = 1, perPage: number = 5): Promise<PaginatedResult<Article>> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const result = await this.pb.collection(this.collectionName).getList<ArticleRecord>(page, perPage, {
                sort: '-created', // Sort by newest first
            });

            // Transform PocketBase records to Article type
            const articles: Article[] = result.items.map(record => this.transformArticle(record));

            return {
                page: result.page,
                perPage: result.perPage,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                items: articles
            };
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to fetch articles from PocketBase';
            this.error.set(errorMessage);
            console.error('PocketBase error:', err);

            // Return empty result on error
            return {
                page: 1,
                perPage: perPage,
                totalItems: 0,
                totalPages: 0,
                items: []
            };
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Get patient details by ID
     */
    async getPatient(patientId: string): Promise<Patient> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const record = await this.pb.collection('patients').getOne<Patient>(patientId);
            return record;
        } catch (err: any) {
            console.error('PocketBase error:', err);
            throw new Error('Failed to fetch patient details');
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Fetch paginated articles from PocketBase
     */
    async getArticleById(id: string): Promise<Article | null> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const record = await this.pb.collection(this.collectionName).getOne<ArticleRecord>(id);
            return this.transformArticle(record);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to fetch article';
            this.error.set(errorMessage);
            console.error('PocketBase error:', err);
            return null;
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Transform PocketBase record to Article type
     */
    private transformArticle(record: ArticleRecord): Article {
        // Format date
        const dateObj = new Date(record.date || record.created);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedDateAr = dateObj.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return {
            id: record.id,
            title: {
                en: record.title_en || '',
                ar: record.title_ar || ''
            },
            excerpt: {
                en: record.excerpt_en || '',
                ar: record.excerpt_ar || ''
            },
            content: {
                en: record.content_en || '',
                ar: record.content_ar || ''
            },
            date: {
                en: formattedDate,
                ar: formattedDateAr
            }
        };
    }

    /**
     * Create a new online booking
     */
    async createBooking(bookingData: Omit<OnlineBooking, 'id' | 'created' | 'updated'>): Promise<OnlineBooking> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const record = await this.pb.collection('website_bookings').create<OnlineBooking>(bookingData);
            console.log('Booking created successfully:', record);
            return record;
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to create booking';
            this.error.set(errorMessage);
            console.error('PocketBase error:', err);
            throw new Error(errorMessage);
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Get patient visits by patient ID with pagination
     * Sorted from most recent to oldest
     */
    async getPatientVisits(patientId: string, page: number = 1, perPage: number = 5): Promise<PaginatedResult<Visit>> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const result = await this.pb.collection('visits').getList<Visit>(page, perPage, {
                filter: `patient_id="${patientId}"`,
                sort: '-visit_date', // Sort by visit_date descending (newest first)
            });

            return {
                page: result.page,
                perPage: result.perPage,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                items: result.items
            };
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to fetch patient visits';
            this.error.set(errorMessage);
            console.error('PocketBase error:', err);
            throw new Error(errorMessage);
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Get PocketBase client instance (for advanced usage)
     */
    getClient(): PocketBase {
        return this.pb;
    }

    /**
     * Get document type by name_en
     */
    async getDocumentTypeByName(name: string): Promise<DocumentType> {
        try {
            return await this.pb.collection('document_type').getFirstListItem<DocumentType>(`name_en="${name}"`);
        } catch (err: any) {
            console.error('PocketBase error fetching document type:', err);
            throw new Error('Failed to fetch document type');
        }
    }

    /**
     * Get patient documents by patient ID, visit ID, and document type ID
     */
    async getPatientDocuments(patientId: string, visitId: string, documentTypeId: string): Promise<PatientDocument[]> {
        try {
            return await this.pb.collection('patient__documents').getFullList<PatientDocument>({
                filter: `patient_id="${patientId}" && related_visit_id="${visitId}" && document_type_id="${documentTypeId}"`,
                sort: '-created',
            });
        } catch (err: any) {
            console.error('PocketBase error fetching patient documents:', err);
            throw new Error('Failed to fetch patient documents');
        }
    }
}

// Document type for prescriptions, reports, etc.
export type DocumentType = {
    id: string;
    name_en: string;
    name_ar: string;
    created?: string;
    updated?: string;
};

// Patient document type
export type PatientDocument = {
    id: string;
    patient_id: string;
    related_visit_id: string;
    document_type_id: string;
    document: string;
    created?: string;
    updated?: string;
};
