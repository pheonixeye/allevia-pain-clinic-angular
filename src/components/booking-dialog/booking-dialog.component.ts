
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDialogComponent {
  dialogService = inject(DialogService);
  translationService = inject(TranslationService);
  translations = this.translationService.translations;

  isSubmitted = signal(false);

  closeDialog() {
    this.dialogService.close();
  }

  submitForm(event: Event) {
    event.preventDefault();
    // In a real app, you would handle form submission here.
    this.isSubmitted.set(true);
  }
}
