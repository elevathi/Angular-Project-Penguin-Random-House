import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PrhApiService } from '../../services/prh-api.service';
import { Author } from '../../models/author.model';
import { Title } from '../../models/title.model';
import { AuthorCardComponent } from '../../components/author-card/author-card.component';
import { TitleCardComponent } from '../../components/title-card/title-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { 
  SearchFormComponent, 
  AuthorSearchCriteria, 
  TitleSearchCriteria 
} from '../../components/search-form/search-form.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    SearchFormComponent,
    AuthorCardComponent, 
    TitleCardComponent,
    LoaderComponent
  ],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">
        <i class="bi bi-search me-2"></i>Iskanje
      </h2>

      <!-- Search Type Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button 
            class="nav-link" 
            [class.active]="searchType === 'authors'"
            (click)="switchTab('authors')">
            <i class="bi bi-people me-1"></i> Avtorji
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            [class.active]="searchType === 'titles'"
            (click)="switchTab('titles')">
            <i class="bi bi-book me-1"></i> Naslovi
          </button>
        </li>
      </ul>

      <!-- Search Form Component (Input/Output demo) -->
      <app-search-form
        #searchForm
        [searchType]="searchType"
        [isLoading]="isLoading"
        (authorSearch)="onAuthorSearch($event)"
        (titleSearch)="onTitleSearch($event)">
      </app-search-form>

      <!-- Error -->
      @if (errorMessage) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
        </div>
      }

      <!-- No Results -->
      @if (!isLoading && hasSearched && !errorMessage) {
        @if (searchType === 'authors' && authors.length === 0) {
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Ni najdenih avtorjev.
          </div>
        }
        @if (searchType === 'titles' && titles.length === 0) {
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Ni najdenih naslovov.
          </div>
        }
      }

      <!-- Author Results -->
      @if (searchType === 'authors' && authors.length > 0) {
        <h5 class="mb-3">
          <i class="bi bi-check-circle text-success me-2"></i>
          Najdeni avtorji ({{ authors.length }})
        </h5>
        <div class="row g-3">
          @for (author of authors; track author.authorid) {
            <div class="col-md-6 col-lg-4">
              <app-author-card 
                [author]="author"
                (authorSelected)="onAuthorSelected($event)">
              </app-author-card>
            </div>
          }
        </div>
      }

      <!-- Title Results -->
      @if (searchType === 'titles' && titles.length > 0) {
        <h5 class="mb-3">
          <i class="bi bi-check-circle text-success me-2"></i>
          Najdeni naslovi ({{ titles.length }})
        </h5>
        <div class="row g-3">
          @for (title of titles; track title.isbn) {
            <div class="col-md-6">
              <app-title-card 
                [title]="title"
                (titleSelected)="onTitleSelected($event)">
              </app-title-card>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class SearchComponent {
  @ViewChild('searchForm') searchFormComponent!: SearchFormComponent;

  private prhApiService = inject(PrhApiService);
  private router = inject(Router);

  searchType: 'authors' | 'titles' = 'authors';
  
  authors: Author[] = [];
  titles: Title[] = [];
  
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  switchTab(type: 'authors' | 'titles'): void {
    this.searchType = type;
    this.clearResults();
    // Reset child form
    if (this.searchFormComponent) {
      this.searchFormComponent.resetForms();
    }
  }

  clearResults(): void {
    this.authors = [];
    this.titles = [];
    this.hasSearched = false;
    this.errorMessage = '';
  }

  // Handle event from child component (Output)
  onAuthorSearch(criteria: AuthorSearchCriteria): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authors = [];

    this.prhApiService.searchAuthors(
      criteria.firstName || undefined,
      criteria.lastName
    ).subscribe({
      next: (response) => {
        if (response.author) {
          this.authors = Array.isArray(response.author) 
            ? response.author 
            : [response.author];
        }
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.errorMessage = 'Napaka pri iskanju. Poskusi ponovno.';
        this.isLoading = false;
        this.hasSearched = true;
      }
    });
  }

  // Handle event from child component (Output)
  onTitleSearch(criteria: TitleSearchCriteria): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.titles = [];

    this.prhApiService.searchTitles(criteria.keyword).subscribe({
      next: (response) => {
        if (response.title) {
          this.titles = Array.isArray(response.title) 
            ? response.title 
            : [response.title];
        }
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.errorMessage = 'Napaka pri iskanju. Poskusi ponovno.';
        this.isLoading = false;
        this.hasSearched = true;
      }
    });
  }

  onAuthorSelected(author: Author): void {
    this.router.navigate(['/author', author.authorid]);
  }

  onTitleSelected(title: Title): void {
    this.router.navigate(['/title', title.isbn]);
  }
}
```

---

## Povzetek Input/Output vzorca
// ```
// ┌─────────────────────────────────────────────────────────────┐
// │                     SearchComponent                          │
// │                        (Parent)                              │
// │                                                              │
// │   ┌─────────────────────────────────────────────────────┐   │
// │   │              SearchFormComponent                     │   │
// │   │                   (Child)                            │   │
// │   │                                                      │   │
// │   │  @Input() searchType      ← 'authors' | 'titles'    │   │
// │   │  @Input() isLoading       ← true | false            │   │
// │   │                                                      │   │
// │   │  @Output() authorSearch   → AuthorSearchCriteria    │   │
// │   │  @Output() titleSearch    → TitleSearchCriteria     │   │
// │   └─────────────────────────────────────────────────────┘   │
// │                                                              │
// │   ┌─────────────────┐    ┌─────────────────┐                │
// │   │ AuthorCard      │    │ TitleCard       │                │
// │   │ @Input() author │    │ @Input() title  │                │
// │   │ @Output() select│    │ @Output() select│                │
// │   └─────────────────┘    └─────────────────┘                │
// └─────────────────────────────────────────────────────────────┘