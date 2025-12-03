
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { DataService } from '../../services/data.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  translationService = inject(TranslationService);
  dataService = inject(DataService);
  dialogService = inject(DialogService);

  translations = this.translationService.translations;
  currentLang = this.translationService.currentLang;
  doctors = this.dataService.getTeam().filter(m => m.name.startsWith('Dr.'));

  openBookingDialog() {
    this.dialogService.open();
  }
}
