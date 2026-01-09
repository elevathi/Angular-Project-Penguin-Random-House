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
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }
}