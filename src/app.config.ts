import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Routes, CanActivateFn, Router, withHashLocation } from '@angular/router';
import { inject } from '@angular/core';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { TranslationService } from './services/translation.service';

export const langGuard: CanActivateFn = (route, state) => {
  const lang = route.params['lang'];
  const translationService = inject(TranslationService);
  const router = inject(Router);

  if (lang === 'en' || lang === 'ar') {
    translationService.setLanguage(lang as 'en' | 'ar');
    return true;
  }
  
  return router.parseUrl('en/home');
};

export const routes: Routes = [
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'articles', component: ArticlesComponent },
      { path: 'articles/:id', component: ArticleDetailComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'en/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'en/home' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
  ]
};