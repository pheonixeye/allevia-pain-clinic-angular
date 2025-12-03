import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { PocketBaseService, type Article } from '../../services/pocketbase.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesComponent {
  translationService = inject(TranslationService);
  pocketbaseService = inject(PocketBaseService);

  translations = this.translationService.translations;
  currentLang = this.translationService.currentLang;

  // State signals
  articles = signal<Article[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  isLoading = this.pocketbaseService.isLoading;
  error = this.pocketbaseService.error;

  private articlesPerPage = 5;

  constructor() {
    // Load articles when component initializes
    this.loadArticles();

    // Reload articles when page changes
    effect(() => {
      const page = this.currentPage();
      this.loadArticles(page);
    }, { allowSignalWrites: true });
  }

  async loadArticles(page: number = 1) {
    const result = await this.pocketbaseService.getArticles(page, this.articlesPerPage);

    this.articles.set(result.items);
    this.currentPage.set(result.page);
    this.totalPages.set(result.totalPages);
    this.totalItems.set(result.totalItems);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  retryLoad() {
    this.loadArticles(this.currentPage());
  }
}