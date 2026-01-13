/**
 * =============================================================================
 * SEARCH FORM COMPONENT
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. @Input()  - Sprejem podatkov od starša (searchType, isLoading)
 * 2. @Output() - Pošiljanje dogodkov staršu (authorSearch, titleSearch)
 * 3. Template Driven Forms (TDF) - Obrazci z ngModel
 * 4. FormsModule - Obvezen import za TDF
 *
 * KAKO DELUJE INPUT/OUTPUT:
 * -------------------------
 * Starš (SearchComponent) pošlje podatke otroku (SearchFormComponent):
 *   <app-search-form [searchType]="'authors'" [isLoading]="true">
 *
 * Otrok pošlje dogodke staršu:
 *   <app-search-form (authorSearch)="onAuthorSearch($event)">
 *
 * ZAKAJ FORMSMODULE:
 * ------------------
 * FormsModule omogoča:
 * - [(ngModel)] za two-way binding
 * - #form="ngForm" za referenco obrazca
 * - Validatorje (required, minlength)
 * =============================================================================
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // OBVEZNO za Template Driven Forms!

/**
 * INTERFACE za iskalne kriterije avtorjev
 * Uporablja se za tipizacijo podatkov v obrazcu
 */
export interface AuthorSearchCriteria {
  firstName: string;
  lastName: string;
}

/**
 * INTERFACE za iskalne kriterije naslovov
 */
export interface TitleSearchCriteria {
  keyword: string;
  title?: string;
  author?: string;
  format?: string;
  excludeNonBooks?: boolean;
}

@Component({
  selector: 'app-search-form',
  standalone: true,  // Standalone komponenta (brez NgModule)
  imports: [
    CommonModule,   // Za *ngIf, *ngFor, ngClass
    FormsModule     // OBVEZNO za ngModel in template-driven forms!
  ],
  templateUrl: './search-form.html'
})
export class SearchFormComponent {

  // ===========================================================================
  // @INPUT() - SPREJEM PODATKOV OD STARŠA
  // ===========================================================================
  /**
   * @Input() dekorator omogoča staršu, da pošlje vrednost v komponento.
   *
   * Uporaba v staršu:
   *   <app-search-form [searchType]="'authors'">
   *
   * Starš → Otrok: enosmerna vezava podatkov
   */
  @Input() searchType: 'authors' | 'titles' = 'authors';

  /**
   * isLoading prikazuje stanje nalaganja (spinner)
   * Starš nastavi true med API klicem
   */
  @Input() isLoading = false;

  // ===========================================================================
  // @OUTPUT() - POŠILJANJE DOGODKOV STARŠU
  // ===========================================================================
  /**
   * @Output() dekorator omogoča otroku, da pošlje dogodke staršu.
   *
   * EventEmitter<T> - generični tip, ki pove kakšne podatke pošiljamo
   *
   * Uporaba v staršu:
   *   <app-search-form (authorSearch)="onSearch($event)">
   *
   * V komponenti:
   *   this.authorSearch.emit({ firstName: 'Dan', lastName: 'Brown' });
   */
  @Output() authorSearch = new EventEmitter<AuthorSearchCriteria>();
  @Output() titleSearch = new EventEmitter<TitleSearchCriteria>();

  // ===========================================================================
  // MODELI OBRAZCEV (za ngModel two-way binding)
  // ===========================================================================
  /**
   * Te objekte povežemo z obrazcem preko [(ngModel)].
   * Two-way binding: spremembe v inputu → objekt, spremembe objekta → input
   */
  authorCriteria: AuthorSearchCriteria = {
    firstName: '',
    lastName: ''
  };

  titleCriteria: TitleSearchCriteria = {
    keyword: '',
    title: '',
    author: '',
    format: '',
    excludeNonBooks: true
  };

  /**
   * Opcije za dropdown meni formata knjige
   * Uporablja se z @for v predlogi
   */
  formatOptions = [
    { code: '', label: 'Vsi formati' },
    { code: 'HC', label: 'Trda vezava' },
    { code: 'TR', label: 'Mehka vezava' },
    { code: 'EL', label: 'E-knjiga' },
    { code: 'AU', label: 'Avdio knjiga' }
  ];

  // ===========================================================================
  // METODE ZA POŠILJANJE OBRAZCA
  // ===========================================================================
  /**
   * Kliče se ob oddaji obrazca avtorjev (ngSubmit)
   *
   * @param form - referenca na NgForm objekt iz predloge (#authorForm="ngForm")
   *
   * form.valid - true če so vsi validatorji uspešni
   *
   * this.authorSearch.emit() - pošlje dogodek staršu z iskalnimi kriteriji
   * Spread operator {...} ustvari kopijo objekta (immutability)
   */
  onAuthorSearch(form: any): void {
    if (form.valid) {
      this.authorSearch.emit({ ...this.authorCriteria });
    }
  }

  /**
   * Kliče se ob oddaji obrazca naslovov
   */
  onTitleSearch(form: any): void {
    if (form.valid) {
      this.titleSearch.emit({ ...this.titleCriteria });
    }
  }

  /**
   * Javna metoda za resetiranje obrazcev
   * Starš jo lahko pokliče preko ViewChild reference
   */
  resetForms(): void {
    this.authorCriteria = { firstName: '', lastName: '' };
    this.titleCriteria = { keyword: '', title: '', author: '', format: '', excludeNonBooks: true };
  }
}
