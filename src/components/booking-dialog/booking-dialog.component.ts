
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { PocketBaseService } from '../../services/pocketbase.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDialogComponent {
  dialogService = inject(DialogService);
  translationService = inject(TranslationService);
  pocketbaseService = inject(PocketBaseService);
  notificationService = inject(NotificationService);

  private fb = inject(FormBuilder);

  translations = this.translationService.translations;
  isSubmitted = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Reactive form with validation
  bookingForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    prefered_date: ['', [Validators.required, this.futureDateValidator.bind(this)]],
    message: ['']
  });

  closeDialog() {
    this.dialogService.close();
    this.resetForm();
  }

  resetForm() {
    this.bookingForm.reset();
    this.isSubmitted.set(false);
    this.isSubmitting.set(false);
    this.errorMessage.set(null);
  }

  async submitForm(event: Event) {
    event.preventDefault();

    // Mark all fields as touched to show validation errors
    this.bookingForm.markAllAsTouched();

    if (this.bookingForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const formData = this.bookingForm.value;

      // Create booking in PocketBase
      const booking = await this.pocketbaseService.createBooking({
        name: formData.name!,
        phone: formData.phone!,
        prefered_date: formData.prefered_date!,
        message: formData.message || undefined
      });

      // Send notification to ntfy (don't await - runs in background)
      this.notificationService.sendBookingNotification({
        name: formData.name!,
        phone: formData.phone!,
        prefered_date: formData.prefered_date!,
        message: formData.message || undefined
      });

      // Show success state
      this.isSubmitted.set(true);
      this.bookingForm.reset();
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to submit booking. Please try again.');
      console.error('Booking submission error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Custom validator for future dates
  private futureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    const t = this.translations;

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return t['booking.error.required'] || 'This field is required';
    }

    if (fieldName === 'name' && field.errors['minlength']) {
      return t['booking.error.nameMin'] || 'Name must be at least 3 characters';
    }

    if (fieldName === 'phone' && field.errors['pattern']) {
      return t['booking.error.phone'] || 'Phone must be exactly 11 digits';
    }

    if (fieldName === 'preferred_date' && field.errors['pastDate']) {
      return t['booking.error.pastDate'] || 'Please select a future date';
    }

    return '';
  }
}
