
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DialogService {
  isBookingDialogOpen = signal(false);

  open() {
    this.isBookingDialogOpen.set(true);
  }

  close() {
    this.isBookingDialogOpen.set(false);
  }
}
