import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { DialogService } from '../../services/dialog.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  // Fix: Corrected typo from `Change.DetectionStrategy.OnPush` to `ChangeDetectionStrategy.OnPush`.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  translationService = inject(TranslationService);
  dialogService = inject(DialogService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  translations = this.translationService.translations;
  currentLang = this.translationService.currentLang;
  isDarkMode = this.themeService.isDarkMode;

  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  openBookingDialog() {
    this.closeMobileMenu();
    this.dialogService.open();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  switchLanguage() {
    this.closeMobileMenu();
    const newLang = this.translations()['nav.langCode'] as 'en' | 'ar';

    // Get the current page segment from the router state snapshot
    const pageSegment = this.router.routerState.snapshot.root.firstChild?.firstChild?.url[0]?.path;

    // Navigate to the same page with the new language, falling back to 'home'
    this.router.navigate([newLang, pageSegment || 'home']);
  }
}