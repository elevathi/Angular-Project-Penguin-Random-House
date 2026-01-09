import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
  templateUrl: './search.html'
})
export class SearchComponent implements OnInit {
  @ViewChild('searchForm') searchFormComponent!: SearchFormComponent;

  private prhApiService = inject(PrhApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchType: 'authors' | 'titles' | 'all-authors' | 'all-titles' = 'authors';

  ngOnInit(): void {
    // Check for query parameter to set initial tab
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'authors' || params['type'] === 'titles' ||
          params['type'] === 'all-authors' || params['type'] === 'all-titles') {
        this.searchType = params['type'];
      }

      // Lazy load data only for the active tab
      if (this.searchType === 'all-authors' && this.allAuthors.length === 0) {
        this.loadAllAuthors();
      } else if (this.searchType === 'all-titles' && this.allTitles.length === 0) {
        this.loadAllTitles();
      }
    });
  }

  allAuthors: Author[] = [];
  allTitles: Title[] = [];
  isLoadingAll = false;

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

  // Sorting for authors
  authorsSortBy: 'firstName' | 'lastName' = 'lastName';
  authorsSortOrder: 'asc' | 'desc' = 'asc';

  // Sorting for titles
  titlesSortBy: 'title' | 'author' | 'price' | 'date' = 'title';
  titlesSortOrder: 'asc' | 'desc' = 'asc';

  // Cached sorted results
  private _cachedSortedAuthors: Author[] | null = null;
  private _cachedSortedTitles: Title[] | null = null;

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

    // Lazy load data only when switching to browse tabs
    if (type === 'all-authors' && this.allAuthors.length === 0) {
      this.loadAllAuthors();
    } else if (type === 'all-titles' && this.allTitles.length === 0) {
      this.loadAllTitles();
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

    this.prhApiService.searchAuthors(criteria.firstName || undefined, criteria.lastName).subscribe({
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

    this.prhApiService.searchTitles(criteria.keyword).subscribe({
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

  // Load all authors for browse tab
  loadAllAuthors(): void {
    this.isLoadingAll = true;
    // Search with empty criteria to get all authors
    this.prhApiService.searchAuthors(undefined, undefined).subscribe({
      next: (response) => {
        if (response.author) {
          this.allAuthors = Array.isArray(response.author) ? response.author : [response.author];
          // Invalidate cache when new data is loaded
          this._cachedSortedAuthors = null;
        }
        this.isLoadingAll = false;
      },
      error: (err) => {
        console.error('Error loading all authors:', err);
        this.isLoadingAll = false;
      }
    });
  }

  // Load all titles for browse tab
  loadAllTitles(): void {
    this.isLoadingAll = true;
    // Search with empty string to get all titles
    this.prhApiService.searchTitles('').subscribe({
      next: (response) => {
        if (response.title) {
          this.allTitles = Array.isArray(response.title) ? response.title : [response.title];
          // Invalidate cache when new data is loaded
          this._cachedSortedTitles = null;
        }
        this.isLoadingAll = false;
      },
      error: (err) => {
        console.error('Error loading all titles:', err);
        this.isLoadingAll = false;
      }
    });
  }

  // Sorting methods
  private sortAuthors(authors: Author[]): Author[] {
    const sorted = [...authors];
    sorted.sort((a, b) => {
      let compareA: string;
      let compareB: string;

      if (this.authorsSortBy === 'firstName') {
        compareA = (a.authorfirst || '').toLowerCase();
        compareB = (b.authorfirst || '').toLowerCase();
      } else {
        compareA = (a.authorlast || '').toLowerCase();
        compareB = (b.authorlast || '').toLowerCase();
      }

      if (compareA < compareB) return this.authorsSortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return this.authorsSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  private sortTitles(titles: Title[]): Title[] {
    const sorted = [...titles];
    sorted.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (this.titlesSortBy) {
        case 'title':
          compareA = (a.titleweb || '').toLowerCase();
          compareB = (b.titleweb || '').toLowerCase();
          break;
        case 'author':
          compareA = (a.authorweb || '').toLowerCase();
          compareB = (b.authorweb || '').toLowerCase();
          break;
        case 'price':
          compareA = parseFloat(a.priceusa || '0');
          compareB = parseFloat(b.priceusa || '0');
          break;
        case 'date':
          compareA = new Date(a.onsaledate || '1900-01-01').getTime();
          compareB = new Date(b.onsaledate || '1900-01-01').getTime();
          break;
      }

      if (compareA < compareB) return this.titlesSortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return this.titlesSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  changeAuthorsSort(sortBy: 'firstName' | 'lastName'): void {
    if (this.authorsSortBy === sortBy) {
      this.authorsSortOrder = this.authorsSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.authorsSortBy = sortBy;
      this.authorsSortOrder = 'asc';
    }
    // Invalidate cache when sort changes
    this._cachedSortedAuthors = null;
    this.allAuthorsCurrentPage = 1;
  }

  changeTitlesSort(sortBy: 'title' | 'author' | 'price' | 'date'): void {
    if (this.titlesSortBy === sortBy) {
      this.titlesSortOrder = this.titlesSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.titlesSortBy = sortBy;
      this.titlesSortOrder = 'asc';
    }
    // Invalidate cache when sort changes
    this._cachedSortedTitles = null;
    this.allTitlesCurrentPage = 1;
  }

  // Pagination getters and methods for browse tabs
  get paginatedAuthors(): Author[] {
    const sorted = this.sortedAuthors;
    const start = (this.allAuthorsCurrentPage - 1) * this.allAuthorsItemsPerPage;
    const end = start + this.allAuthorsItemsPerPage;
    return sorted.slice(start, end);
  }

  get paginatedTitles(): Title[] {
    const sorted = this.sortedTitles;
    const start = (this.allTitlesCurrentPage - 1) * this.allTitlesItemsPerPage;
    const end = start + this.allTitlesItemsPerPage;
    return sorted.slice(start, end);
  }

  get sortedAuthors(): Author[] {
    if (!this._cachedSortedAuthors) {
      this._cachedSortedAuthors = this.sortAuthors(this.allAuthors);
    }
    return this._cachedSortedAuthors;
  }

  get sortedTitles(): Title[] {
    if (!this._cachedSortedTitles) {
      this._cachedSortedTitles = this.sortTitles(this.allTitles);
    }
    return this._cachedSortedTitles;
  }

  get totalAuthorsPages(): number {
    return Math.ceil(this.sortedAuthors.length / this.allAuthorsItemsPerPage);
  }

  get totalTitlesPages(): number {
    return Math.ceil(this.sortedTitles.length / this.allTitlesItemsPerPage);
  }

  changeAuthorsPage(page: number): void {
    this.allAuthorsCurrentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changeTitlesPage(page: number): void {
    this.allTitlesCurrentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Helper methods for template
  getAuthorSortIcon(sortType: 'firstName' | 'lastName'): string {
    if (this.authorsSortBy !== sortType) return 'bi-sort-alpha-down';
    return this.authorsSortOrder === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up';
  }

  getTitleSortIcon(sortType: 'title' | 'author' | 'price' | 'date'): string {
    if (this.titlesSortBy !== sortType) {
      return sortType === 'price' ? 'bi-sort-numeric-down' :
             sortType === 'date' ? 'bi-sort-down' : 'bi-sort-alpha-down';
    }

    if (sortType === 'price') {
      return this.titlesSortOrder === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up';
    } else if (sortType === 'date') {
      return this.titlesSortOrder === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
    } else {
      return this.titlesSortOrder === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up';
    }
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
