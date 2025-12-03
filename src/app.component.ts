import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BookingDialogComponent } from './components/booking-dialog/booking-dialog.component';
import { DialogService } from './services/dialog.service';
import { TranslationService } from './services/translation.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, BookingDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.lang]': 'lang()',
    '[attr.dir]': 'dir()',
    'class': 'flex flex-col min-h-screen',
  }
})
export class AppComponent {
  dialogService = inject(DialogService);
  translationService = inject(TranslationService);
  themeService = inject(ThemeService); // Initialize theme service

  isBookingOpen = this.dialogService.isBookingDialogOpen;

  lang = this.translationService.currentLang;
  dir = computed(() => this.lang() === 'ar' ? 'rtl' : 'ltr');
}