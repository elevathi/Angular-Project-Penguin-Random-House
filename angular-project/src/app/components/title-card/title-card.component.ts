import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '../../models/title.model';
import { HighlightDirective } from '../../directives/highlight.directive';
import { PrhApiService } from '../../services/prh-api.service';

@Component({
  selector: 'app-title-card',
  standalone: true,
  imports: [CommonModule, HighlightDirective],
  template: './title-card.html',
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