import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuthorSearchCriteria {
  firstName: string;
  lastName: string;
}

export interface TitleSearchCriteria {
  keyword: string;
  title?: string;        // Search specifically by title
  author?: string;       // Filter by author name
  format?: string;       // Format code filter (e.g., 'HC' for hardcover, 'TR' for paperback)
  excludeNonBooks?: boolean;  // Exclude non-book items like mugs, puzzles
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-form.html'
})
export class SearchFormComponent {
  // INPUTS
  @Input() searchType: 'authors' | 'titles' = 'authors';
  @Input() isLoading = false;

  // OUTPUTS
  @Output() authorSearch = new EventEmitter<AuthorSearchCriteria>();
  @Output() titleSearch = new EventEmitter<TitleSearchCriteria>();

  // Form models
  authorCriteria: AuthorSearchCriteria = {
    firstName: '',
    lastName: ''
  };

  titleCriteria: TitleSearchCriteria = {
    keyword: '',
    title: '',
    author: '',
    format: '',
    excludeNonBooks: true  // Default: exclude mugs, puzzles, etc.
  };

  // Common book format codes
  formatOptions = [
    { code: '', label: 'Vsi formati' },
    { code: 'HC', label: 'Trda vezava' },
    { code: 'TR', label: 'Mehka vezava' },
    { code: 'EL', label: 'E-knjiga' },
    { code: 'AU', label: 'Avdio knjiga' }
  ];

  onAuthorSearch(form: any): void {
    if (form.valid) {
      this.authorSearch.emit({ ...this.authorCriteria });
    }
  }

  onTitleSearch(form: any): void {
    if (form.valid) {
      this.titleSearch.emit({ ...this.titleCriteria });
    }
  }

  // Public method to reset forms (can be called from parent)
  resetForms(): void {
    this.authorCriteria = { firstName: '', lastName: '' };
    this.titleCriteria = { keyword: '', title: '', author: '', format: '', excludeNonBooks: true };
  }
}