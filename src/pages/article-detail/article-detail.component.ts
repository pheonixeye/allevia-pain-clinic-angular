import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { TranslationService } from '../../services/translation.service';
import { PocketBaseService, type Article } from '../../services/pocketbase.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent {
  private route = inject(ActivatedRoute);
  private pocketbaseService = inject(PocketBaseService);
  translationService = inject(TranslationService);

  translations = this.translationService.translations;
  currentLang = this.translationService.currentLang;

  private articleId = toSignal(this.route.params.pipe(map(params => params['id'])));

  article = signal<Article | null>(null);
  isLoading = this.pocketbaseService.isLoading;
  error = this.pocketbaseService.error;

  constructor() {
    // Load article when ID changes
    effect(() => {
      const id = this.articleId();
      if (id) {
        this.loadArticle(id);
      }
    }, { allowSignalWrites: true });
  }

  async loadArticle(id: string) {
    const article = await this.pocketbaseService.getArticleById(id);
    this.article.set(article);
  }

  retryLoad() {
    const id = this.articleId();
    if (id) {
      this.loadArticle(id);
    }
  }
}
