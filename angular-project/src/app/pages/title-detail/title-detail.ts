import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrhApiService } from '../../services/prh-api.service';
import { Title } from '../../models/title.model';
import { LoaderComponent } from '../../components/loader/loader.component';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-title-detail',
  imports: [CommonModule, LoaderComponent, HighlightDirective],
  templateUrl: 'title-detail.html',
  styleUrl: 'title-detail.css',
})
export class TitleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prhApiService = inject(PrhApiService);

  title: Title | null = null;
  isLoading = false;
  errorMessage = '';

  // Local SVG placeholder (no external dependency)
  private readonly placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect fill='%23e9ecef' width='200' height='300'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='16'%3ENo%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='16'%3ECover%3C/text%3E%3C/svg%3E`;

  ngOnInit(): void {
    const isbn = this.route.snapshot.paramMap.get('isbn');
    if (isbn) {
      this.loadTitle(isbn);
    }
  }

  loadTitle(isbn: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prhApiService.getTitleByIsbn(isbn).subscribe({
      next: (title) => {
        this.title = title;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading title:', err);
        this.errorMessage = 'Napaka pri nalaganju knjige.';
        this.isLoading = false;
      }
    });
  }

  getCoverUrl(): string {
    return this.prhApiService.getCoverImageUrl(this.title?.isbn || '');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderImage;
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  getEurPrice(priceUsd: string | undefined): string {
    return PrhApiService.convertUsdToEur(priceUsd);
  }
}