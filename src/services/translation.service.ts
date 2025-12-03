
import { Injectable, signal, computed } from '@angular/core';
import { en } from '../i18n/en';
import { ar } from '../i18n/ar';

type Translation = typeof en;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translationsMap = { en, ar };
  
  currentLang = signal<'en' | 'ar'>('en');
  
  translations = computed<Translation>(() => this.translationsMap[this.currentLang()]);

  setLanguage(lang: 'en' | 'ar') {
    this.currentLang.set(lang);
  }

  translate(key: keyof Translation): string {
    return this.translations()[key] || key;
  }
}
