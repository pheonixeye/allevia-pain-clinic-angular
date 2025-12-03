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
     * Get a single article by ID
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
     * Get PocketBase client instance (for advanced usage)
     */
    getClient(): PocketBase {
        return this.pb;
    }
}
