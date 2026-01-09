import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '../../models/title.model';
import { HighlightDirective } from '../../directives/highlight.directive';
import { PrhApiService } from '../../services/prh-api.service';

@Component({
  selector: 'app-title-card',
  standalone: true,
  imports: [CommonModule, HighlightDirective],
  template: `
    <div 
      class="card h-100 cursor-pointer"
      appHighlight="#fff3e0"
      (click)="onTitleClick()">
      <div class="row g-0">
        <div class="col-4">
          <img 
            [src]="getCoverUrl()" 
            class="img-fluid rounded-start" 
            [alt]="title.titleweb"
            (error)="onImageError($event)"
            style="max-height: 180px; object-fit: cover;">
        </div>
        <div class="col-8">
          <div class="card-body">
            <h6 class="card-title">{{ title.titleweb }}</h6>
            <p class="card-text small text-muted mb-1">
              {{ title.authorweb }}
            </p>
            <p class="card-text">
              <span 
                class="badge"
                [ngClass]="{
                  'bg-primary': title.formatcode === 'HC',
                  'bg-secondary': title.formatcode === 'MM',
                  'bg-success': title.formatcode === 'EL',
                  'bg-info': title.formatcode !== 'HC' && title.formatcode !== 'MM' && title.formatcode !== 'EL'
                }">
                {{ title.formatname }}
              </span>
            </p>
            @if (title.priceusa) {
              <p class="card-text fw-bold text-success">
                {{ '$' + title.priceusa }}
              </p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  `]
})
export class TitleCardComponent {
  @Input({ required: true }) title!: Title;
  @Output() titleSelected = new EventEmitter<Title>();

  constructor(private prhApiService: PrhApiService) {}

  getCoverUrl(): string {
    return this.prhApiService.getCoverImageUrl(this.title.isbn);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/120x180?text=No+Cover';
  }

  onTitleClick(): void {
    this.titleSelected.emit(this.title);
  }
}