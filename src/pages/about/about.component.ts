
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  translationService = inject(TranslationService);
  dataService = inject(DataService);

  translations = this.translationService.translations;
  currentLang = this.translationService.currentLang;
  team = this.dataService.getTeam();
}
