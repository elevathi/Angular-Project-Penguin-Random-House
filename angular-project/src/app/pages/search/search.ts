import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PrhApiService } from '../../services/prh-api.service';
import { Author } from '../../models/author.model';
import { Title } from '../../models/title.model';
import { AuthorCardComponent } from '../../components/author-card/author-card.component';
import { TitleCardComponent } from '../../components/title-card/title-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
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
    });

    // Load all data initially for the browse tabs
    this.loadAllAuthors();
    this.loadAllTitles();
  }

  allAuthors: Author[] = [];
  allTitles: Title[] = [];
  isLoadingAll = false;

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
        }
        this.isLoadingAll = false;
      },
      error: (err) => {
        console.error('Error loading all titles:', err);
        this.isLoadingAll = false;
      }
    });
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
