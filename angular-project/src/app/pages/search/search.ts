import { Component, inject, ViewChild, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrhApiService } from '../../services/prh-api.service';
import { Author } from '../../models/author.model';
import { Title } from '../../models/title.model';
import { AuthorCardComponent } from '../../components/author-card/author-card.component';
import { TitleCardComponent } from '../../components/title-card/title-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { PaginationComponent } from '../../components/pagination/pagination';
import {
  SearchFormComponent,
  AuthorSearchCriteria,
  TitleSearchCriteria,
} from '../../components/search-form/search-form.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    SearchFormComponent,
    AuthorCardComponent,
    TitleCardComponent,
    LoaderComponent,
    PaginationComponent,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  @ViewChild('searchForm') searchFormComponent!: SearchFormComponent;

  private prhApiService = inject(PrhApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  searchType: 'authors' | 'titles' | 'all-authors' | 'all-titles' = 'authors';

  ngOnInit(): void {
    // Check for query parameter to set initial tab
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['type'] === 'authors' || params['type'] === 'titles' ||
          params['type'] === 'all-authors' || params['type'] === 'all-titles') {
        this.searchType = params['type'];
      }

      // Load first page for browse tabs
      if (this.searchType === 'all-authors' && !this.authorsPageCache.has(1)) {
        this.loadAuthorsPage(1);
      } else if (this.searchType === 'all-titles' && !this.titlesPageCache.has(1)) {
        this.loadTitlesPage(1);
      }
    });
  }

  // Browse tabs - on-demand page loading with cache
  isLoadingAuthorsPage = false;
  isLoadingTitlesPage = false;
  totalAuthorsCount = 0;  // Total available from API
  totalTitlesCount = 0;   // Total available from API

  // Page caches: Map<pageNumber, items[]>
  private authorsPageCache = new Map<number, Author[]>();
  private titlesPageCache = new Map<number, Title[]>();

  // Current page items (for display)
  currentAuthorsPage: Author[] = [];
  currentTitlesPage: Title[] = [];

  // Pagination for all authors
  allAuthorsCurrentPage = 1;
  allAuthorsItemsPerPage = 9;

  // Pagination for all titles
  allTitlesCurrentPage = 1;
  allTitlesItemsPerPage = 6;

  // Pagination for search results
  searchAuthorsCurrentPage = 1;
  searchAuthorsItemsPerPage = 9;
  searchTitlesCurrentPage = 1;
  searchTitlesItemsPerPage = 6;

  // Search results (not paginated from API)
  authors: Author[] = [];
  titles: Title[] = [];

  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  switchTab(type: 'authors' | 'titles' | 'all-authors' | 'all-titles'): void {
    this.searchType = type;
    this.clearResults();
    // Reset child form
    if (this.searchFormComponent) {
      this.searchFormComponent.resetForms();
    }

    // Load first page when switching to browse tabs (if not cached)
    if (type === 'all-authors' && !this.authorsPageCache.has(1)) {
      this.loadAuthorsPage(1);
    } else if (type === 'all-titles' && !this.titlesPageCache.has(1)) {
      this.loadTitlesPage(1);
    }
  }

  clearResults(): void {
    this.authors = [];
    this.titles = [];
    this.hasSearched = false;
    this.errorMessage = '';
    this.searchAuthorsCurrentPage = 1;
    this.searchTitlesCurrentPage = 1;
  }

  // Handle event from child component (Output)
  onAuthorSearch(criteria: AuthorSearchCriteria): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authors = [];

    // Search with up to 50 results for targeted searches
    this.prhApiService.searchAuthors(criteria.firstName || undefined, criteria.lastName, 0, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.author) {
            this.authors = Array.isArray(response.author) ? response.author : [response.author];
          }
          this.hasSearched = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.errorMessage = 'Napaka pri iskanju. Poskusi ponovno.';
          this.isLoading = false;
          this.hasSearched = true;
        },
      });
  }

  // Handle event from child component (Output)
  onTitleSearch(criteria: TitleSearchCriteria): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.titles = [];

    // Search with full criteria including filters
    this.prhApiService.searchTitles(criteria, 0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.title) {
            this.titles = Array.isArray(response.title) ? response.title : [response.title];
          }
          this.hasSearched = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.errorMessage = 'Napaka pri iskanju. Poskusi ponovno.';
          this.isLoading = false;
          this.hasSearched = true;
        },
      });
  }

  onAuthorSelected(author: Author): void {
    this.router.navigate(['/author', author.authorid]);
  }

  onTitleSelected(title: Title): void {
    this.router.navigate(['/title', title.isbn]);
  }

  // Load authors page on-demand with caching
  loadAuthorsPage(page: number): void {
    // Check cache first
    if (this.authorsPageCache.has(page)) {
      this.currentAuthorsPage = this.authorsPageCache.get(page)!;
      this.allAuthorsCurrentPage = page;
      return;
    }

    this.isLoadingAuthorsPage = true;
    const start = (page - 1) * this.allAuthorsItemsPerPage;

    this.prhApiService.getAuthorsPaginated(start, this.allAuthorsItemsPerPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authorsPageCache.set(page, response.authors);
          this.currentAuthorsPage = response.authors;
          this.totalAuthorsCount = response.totalCount;
          this.allAuthorsCurrentPage = page;
          this.isLoadingAuthorsPage = false;
        },
        error: (err) => {
          console.error('Error loading authors page:', err);
          this.isLoadingAuthorsPage = false;
        }
      });
  }

  // Load titles page on-demand with caching
  loadTitlesPage(page: number): void {
    // Check cache first
    if (this.titlesPageCache.has(page)) {
      this.currentTitlesPage = this.titlesPageCache.get(page)!;
      this.allTitlesCurrentPage = page;
      return;
    }

    this.isLoadingTitlesPage = true;
    const start = (page - 1) * this.allTitlesItemsPerPage;

    this.prhApiService.getTitlesPaginated(start, this.allTitlesItemsPerPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.titlesPageCache.set(page, response.titles);
          this.currentTitlesPage = response.titles;
          this.totalTitlesCount = response.totalCount;
          this.allTitlesCurrentPage = page;
          this.isLoadingTitlesPage = false;
        },
        error: (err) => {
          console.error('Error loading titles page:', err);
          this.isLoadingTitlesPage = false;
        }
      });
  }

  // Pagination totals from API
  get totalAuthorsPages(): number {
    return Math.ceil(this.totalAuthorsCount / this.allAuthorsItemsPerPage);
  }

  get totalTitlesPages(): number {
    return Math.ceil(this.totalTitlesCount / this.allTitlesItemsPerPage);
  }

  // Change page handlers - load on demand
  changeAuthorsPage(page: number): void {
    this.loadAuthorsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changeTitlesPage(page: number): void {
    this.loadTitlesPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Get loaded pages count for display
  get loadedAuthorsPages(): number {
    return this.authorsPageCache.size;
  }

  get loadedTitlesPages(): number {
    return this.titlesPageCache.size;
  }

  // Pagination getters and methods for search results
  get paginatedSearchAuthors(): Author[] {
    const start = (this.searchAuthorsCurrentPage - 1) * this.searchAuthorsItemsPerPage;
    const end = start + this.searchAuthorsItemsPerPage;
    return this.authors.slice(start, end);
  }

  get paginatedSearchTitles(): Title[] {
    const start = (this.searchTitlesCurrentPage - 1) * this.searchTitlesItemsPerPage;
    const end = start + this.searchTitlesItemsPerPage;
    return this.titles.slice(start, end);
  }

  get totalSearchAuthorsPages(): number {
    return Math.ceil(this.authors.length / this.searchAuthorsItemsPerPage);
  }

  get totalSearchTitlesPages(): number {
    return Math.ceil(this.titles.length / this.searchTitlesItemsPerPage);
  }

  changeSearchAuthorsPage(page: number): void {
    this.searchAuthorsCurrentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changeSearchTitlesPage(page: number): void {
    this.searchTitlesCurrentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ## Povzetek Input/Output vzorca

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
