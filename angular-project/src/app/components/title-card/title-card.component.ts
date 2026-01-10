import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '../../models/title.model';
import { PrhApiService } from '../../services/prh-api.service';

@Component({
  selector: 'app-title-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title-card.html',
  styleUrl: './title-card.css'
 })
export class TitleCardComponent {
  @Input({ required: true }) title!: Title;
  @Output() titleSelected = new EventEmitter<Title>();

  // Local SVG placeholder (no external dependency)
  private readonly placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='180' viewBox='0 0 120 180'%3E%3Crect fill='%23e9ecef' width='120' height='180'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='12'%3ENo%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='12'%3ECover%3C/text%3E%3C/svg%3E`;

  constructor(private prhApiService: PrhApiService) {}

  getCoverUrl(): string {
    return this.prhApiService.getCoverImageUrl(this.title.isbn);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderImage;
  }

  onTitleClick(): void {
    this.titleSelected.emit(this.title);
  }

  getEurPrice(): string {
    return PrhApiService.convertUsdToEur(this.title.priceusa);
  }
}