import { Component, inject, ViewChild, OnInit, DestroyRef, HostListener } from '@angular/core';
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
    // Start background preloading of titles
    this.preloadTitlesInBackground();

    // Check for query parameter to set initial tab
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['type'] === 'authors' || params['type'] === 'titles' ||
          params['type'] === 'all-authors' || params['type'] === 'all-titles') {
        this.searchType = params['type'];
      }

      // Load first page for browse tabs
      if (this.searchType === 'all-authors' && this.authorsCache.length === 0) {
        this.loadAuthorsPage(1);
      } else if (this.searchType === 'all-titles' && this.titlesCache.length === 0) {
        this.loadTitlesPage(1);
      }
    });
  }

  // Preload 1000 titles in background for instant browsing
  private preloadTitlesInBackground(): void {
    const TOTAL_TO_PRELOAD = 1000;
    const BATCH_SIZE = 100;

    // Load in batches of 100
    for (let start = 0; start < TOTAL_TO_PRELOAD; start += BATCH_SIZE) {
      this.prhApiService.getTitlesPaginated(start, BATCH_SIZE)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            // Update total count
            if (this.totalTitlesCount === 0) {
              this.totalTitlesCount = response.totalCount;
            }

            // Add to flat cache (avoid duplicates by checking index)
            response.titles.forEach((title, i) => {
              const index = start + i;
              if (index >= this.titlesCache.length) {
                this.titlesCache.push(title);
              }
            });

            // Sort cache by index position (in case batches arrive out of order)
            // Already handled by push order

            // If this is the first batch and we're on all-titles, show first page
            if (start === 0 && this.searchType === 'all-titles') {
              this.allTitlesCurrentPage = 1;
            }
          }
        });
    }
  }

  // Browse tabs - on-demand page loading with cache
  isLoadingAuthorsPage = false;
  isLoadingTitlesPage = false;
  totalAuthorsCount = 0;  // Total available from API
  totalTitlesCount = 0;   // Total available from API

  // Flat caches for dynamic page sizing
  private authorsCache: Author[] = [];
  private titlesCache: Title[] = [];

  // Current page items (computed from cache based on dynamic page size)
  get currentAuthorsPage(): Author[] {
    const start = (this.allAuthorsCurrentPage - 1) * this.allAuthorsItemsPerPage;
    return this.authorsCache.slice(start, start + this.allAuthorsItemsPerPage);
  }

  get currentTitlesPage(): Title[] {
    const start = (this.allTitlesCurrentPage - 1) * this.allTitlesItemsPerPage;
    return this.titlesCache.slice(start, start + this.allTitlesItemsPerPage);
  }

  // Number of cached items
  get loadedAuthorsCount(): number {
    return this.authorsCache.length;
  }

  get loadedTitlesCount(): number {
    return this.titlesCache.length;
  }

  // Pagination for all authors
  allAuthorsCurrentPage = 1;

  // Pagination for all titles
  allTitlesCurrentPage = 1;

  // Pagination for search results
  searchAuthorsCurrentPage = 1;
  searchTitlesCurrentPage = 1;

  // Dynamic items per page based on screen size
  get allAuthorsItemsPerPage(): number {
    return this.calculateAuthorsPerPage();
  }

  get allTitlesItemsPerPage(): number {
    return this.calculateTitlesPerPage();
  }

  get searchAuthorsItemsPerPage(): number {
    return this.calculateAuthorsPerPage();
  }

  get searchTitlesItemsPerPage(): number {
    return this.calculateTitlesPerPage();
  }

  // Calculate items per page based on viewport width
  private calculateAuthorsPerPage(): number {
    const width = window.innerWidth;
    if (width < 768) return 6;      // Mobile: 2 cols x 3 rows
    if (width < 992) return 8;      // Tablet: 2 cols x 4 rows
    if (width < 1400) return 12;    // Desktop: 3 cols x 4 rows
    return 15;                       // Large: 3 cols x 5 rows
  }

  private calculateTitlesPerPage(): number {
    const width = window.innerWidth;
    if (width < 768) return 4;      // Mobile: 1 col x 4 rows
    if (width < 992) return 6;      // Tablet: 2 cols x 3 rows
    if (width < 1400) return 8;     // Desktop: 2 cols x 4 rows
    return 10;                       // Large: 2 cols x 5 rows
  }

  @HostListener('window:resize')
  onResize(): void {
    // Force change detection on resize (getters will recalculate)
  }

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
    if (type === 'all-authors' && this.authorsCache.length === 0) {
      this.loadAuthorsPage(1);
    } else if (type === 'all-titles' && this.titlesCache.length === 0) {
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
    this.allAuthorsCurrentPage = page;
    const startIndex = (page - 1) * this.allAuthorsItemsPerPage;
    const endIndex = startIndex + this.allAuthorsItemsPerPage;

    // Check if we have enough cached items for this page
    if (this.authorsCache.length >= endIndex ||
        (this.totalAuthorsCount > 0 && this.authorsCache.length >= this.totalAuthorsCount)) {
      return; // Data already in cache, getter will slice it
    }

    // Need to load more data
    this.isLoadingAuthorsPage = true;
    const loadFrom = this.authorsCache.length; // Continue from where we left off

    this.prhApiService.getAuthorsPaginated(loadFrom, Math.max(100, this.allAuthorsItemsPerPage))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Append to flat cache
          this.authorsCache.push(...response.authors);
          this.totalAuthorsCount = response.totalCount;
          this.isLoadingAuthorsPage = false;
        },
        error: (err) => {
          console.error('Error loading authors:', err);
          this.isLoadingAuthorsPage = false;
        }
      });
  }

  // Load titles page on-demand with caching
  loadTitlesPage(page: number): void {
    this.allTitlesCurrentPage = page;
    const startIndex = (page - 1) * this.allTitlesItemsPerPage;
    const endIndex = startIndex + this.allTitlesItemsPerPage;

    // Check if we have enough cached items for this page
    if (this.titlesCache.length >= endIndex ||
        (this.totalTitlesCount > 0 && this.titlesCache.length >= this.totalTitlesCount)) {
      return; // Data already in cache, getter will slice it
    }

    // Need to load more data
    this.isLoadingTitlesPage = true;
    const loadFrom = this.titlesCache.length; // Continue from where we left off

    this.prhApiService.getTitlesPaginated(loadFrom, Math.max(100, this.allTitlesItemsPerPage))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Append to flat cache
          this.titlesCache.push(...response.titles);
          this.totalTitlesCount = response.totalCount;
          this.isLoadingTitlesPage = false;
        },
        error: (err) => {
          console.error('Error loading titles:', err);
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

  // Get cached items count for display
  get loadedAuthorsPages(): number {
    return this.authorsCache.length;
  }

  get loadedTitlesPages(): number {
    return this.titlesCache.length;
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
