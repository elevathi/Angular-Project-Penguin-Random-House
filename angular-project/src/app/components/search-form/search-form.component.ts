import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuthorSearchCriteria {
  firstName: string;
  lastName: string;
}

export interface TitleSearchCriteria {
  keyword: string;
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule]
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
    keyword: ''
  };

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
    this.titleCriteria = { keyword: '' };
  }
}