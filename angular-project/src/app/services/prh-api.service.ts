/**
 * =============================================================================
 * PRH API SERVICE - STORITEV ZA API KLICE
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. HttpClient          - Angular-ov HTTP odjemalec
 * 2. Observable<T>       - Asinhroni podatkovni tok (RxJS)
 * 3. pipe() in map()     - RxJS operatorji za transformacijo
 * 4. HttpParams          - Gradnja query parametrov
 * 5. @Injectable         - Dependency Injection
 *
 * KAJ JE OBSERVABLE?
 * ------------------
 * Observable je kot "obljuba" (Promise), ki lahko vrne VEČ vrednosti.
 *
 *   Promise:    Vrne ENO vrednost ali napako
 *   Observable: Lahko emitira 0, 1, ali VEČ vrednosti skozi čas
 *
 * Observable vs Promise:
 * ----------------------
 *   Promise:
 *     fetch('/api/data').then(data => console.log(data));
 *
 *   Observable:
 *     this.http.get('/api/data').subscribe(data => console.log(data));
 *
 * KAKO DELUJE HTTP KLIC Z OBSERVABLE:
 * -----------------------------------
 *
 *   ┌────────────────────────────────────────────────────────────────────────┐
 *   │                        OBSERVABLE FLOW                                 │
 *   │                                                                        │
 *   │  1. Ustvari Observable (NE pošlje zahteve še!)                        │
 *   │     const obs$ = this.http.get('/api/authors');                       │
 *   │                                                                        │
 *   │  2. Subscribe sproži HTTP zahtevo                                     │
 *   │     obs$.subscribe(data => ...);                                      │
 *   │                                                                        │
 *   │  3. Ko pride odgovor, Observable emitira vrednost                     │
 *   │     next: (data) => { this.authors = data; }                          │
 *   │                                                                        │
 *   │  4. Observable se zaključi (complete) ali javi napako (error)         │
 *   └────────────────────────────────────────────────────────────────────────┘
 *
 * RxJS OPERATORJI (pipe):
 * -----------------------
 *
 *   this.http.get('/api').pipe(
 *     map(data => transform(data)),     // Transformira podatke
 *     filter(data => data.valid),       // Filtrira
 *     catchError(err => handleError())  // Lovi napake
 *   ).subscribe(...);
 *
 * =============================================================================
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';
import { environment } from '../../environments/environment';
import { TitleSearchCriteria } from '../components/search-form/search-form.component';

// ===========================================================================
// API RESPONSE INTERFACES
// ===========================================================================
/**
 * TypeScript interfaces za API odgovore
 * Omogočajo type safety pri delu z zunanjimi API-ji
 */
interface ApiV2Author {
  authorId: number;
  display: string;
  first: string;
  last: string;
}

interface ApiV2AuthorsResponse {
  recordCount: number;
  data: {
    authors: ApiV2Author[];
  };
}

interface ApiV2Title {
  isbn: number;
  title: string;
  subtitle?: string;
  author: string;
  onsale: string;
  price: Array<{ amount: number; currencyCode: string }>;
  format: { code: string; description: string };
  pages?: number;
}

interface ApiV2TitlesResponse {
  recordCount: number;
  data: {
    titles: ApiV2Title[];
  };
}

/**
 * Paginated response types za komponente
 */
export interface PaginatedAuthorsResponse {
  authors: Author[];
  totalCount: number;
}

export interface PaginatedTitlesResponse {
  titles: Title[];
  totalCount: number;
}

// ===========================================================================
// API SERVICE
// ===========================================================================
@Injectable({
  providedIn: 'root'  // Singleton na root nivoju
})
export class PrhApiService {
  /**
   * Base URL za API klice
   * Uporabljamo proxy (/api) za izogib CORS problemom
   */
  private baseUrl = '/api';
  private apiKey = environment.prhApiKey;
  private static readonly USD_TO_EUR_RATE = 0.92;

  // ===========================================================================
  // DEPENDENCY INJECTION - HttpClient
  // ===========================================================================
  /**
   * HttpClient je Angular-ova storitev za HTTP komunikacijo
   *
   * Angular jo samodejno vstavi preko DI
   * Vrača Observable<T> namesto Promise<T>
   *
   * Metode:
   *   - get<T>(url, options)     - GET zahteva
   *   - post<T>(url, body)       - POST zahteva
   *   - put<T>(url, body)        - PUT zahteva
   *   - delete<T>(url)           - DELETE zahteva
   */
  constructor(private http: HttpClient) {}

  /**
   * Statična metoda za pretvorbo valut
   * static = lahko kličeš brez instance: PrhApiService.convertUsdToEur(...)
   */
  static convertUsdToEur(priceUsd: string | undefined): string {
    if (!priceUsd) return '0.00';
    const usdAmount = parseFloat(priceUsd);
    if (isNaN(usdAmount)) return '0.00';
    const eurAmount = usdAmount * PrhApiService.USD_TO_EUR_RATE;
    return eurAmount.toFixed(2);
  }

  /**
   * Mapper: Pretvori API format v naš model
   * Ločimo zunanjo strukturo API-ja od notranje strukture aplikacije
   */
  private mapApiAuthorToModel(apiAuthor: ApiV2Author): Author {
    return {
      authorid: apiAuthor.authorId.toString(),
      authordisplay: apiAuthor.display,
      authorfirst: apiAuthor.first || '',
      authorlast: apiAuthor.last || '',
      authorfirstlc: (apiAuthor.first || '').toLowerCase(),
      authorlastlc: (apiAuthor.last || '').toLowerCase(),
      authorlastfirst: `${apiAuthor.last}, ${apiAuthor.first}`,
      lastinitial: apiAuthor.last ? apiAuthor.last.charAt(0).toUpperCase() : ''
    };
  }

  // ===========================================================================
  // ISKANJE AVTORJEV - Observable + pipe + map
  // ===========================================================================
  /**
   * OBSERVABLE METODA:
   * ==================
   * Vrne Observable<AuthorsResponse> - NE izvede HTTP klica takoj!
   *
   * HTTP klic se izvede šele ko nekdo pokliče .subscribe()
   *
   * PRIMER UPORABE V KOMPONENTI:
   * ----------------------------
   *   this.prhApiService.searchAuthors('Dan', 'Brown')
   *     .subscribe({
   *       next: (response) => {
   *         this.authors = response.author;
   *       },
   *       error: (err) => {
   *         console.error('Napaka:', err);
   *       }
   *     });
   *
   * HTTPPARAMS:
   * -----------
   * Gradnja query string parametrov na type-safe način
   *   new HttpParams().set('key', 'value').set('key2', 'value2')
   *   → ?key=value&key2=value2
   */
  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    // Gradnja query parametrov
    let params = new HttpParams()
      .set('start', '0')
      .set('rows', '200')
      .set('api_key', this.apiKey);

    if (lastName && lastName.length > 0) {
      params = params.set('authorLastInitial', lastName.charAt(0).toUpperCase());
      params = params.set('sort', 'authorLast');
    }

    const firstNameLower = firstName?.toLowerCase() || '';
    const lastNameLower = lastName?.toLowerCase() || '';

    /**
     * HTTP GET + pipe + map:
     * ======================
     *
     * this.http.get<T>(url, { params })
     *   - Izvede GET zahtevo
     *   - <T> je pričakovan tip odgovora
     *   - Vrne Observable<T>
     *
     * .pipe(operator1, operator2, ...)
     *   - Veriženje RxJS operatorjev
     *   - Vsak operator transformira tok podatkov
     *
     * map(response => ...)
     *   - RxJS operator za transformacijo
     *   - Podobno kot Array.map(), ampak za Observable
     *   - Prejme vrednost, vrne transformirano vrednost
     */
    return this.http.get<ApiV2AuthorsResponse>(`${this.baseUrl}/authors`, { params }).pipe(
      map(response => {
        // Transformacija: API format → naš model
        let authors = response.data.authors.map(a => this.mapApiAuthorToModel(a));

        // Client-side filtriranje
        if (lastNameLower) {
          authors = authors.filter(a =>
            a.authorlastlc?.startsWith(lastNameLower) ||
            a.authorlast?.toLowerCase().startsWith(lastNameLower)
          );
        }
        if (firstNameLower) {
          authors = authors.filter(a =>
            a.authorfirstlc?.startsWith(firstNameLower) ||
            a.authorfirst?.toLowerCase().startsWith(firstNameLower)
          );
        }

        return { author: authors };
      })
    );
  }

  /**
   * Paginirani avtorji s skupnim številom
   */
  getAuthorsPaginated(start: number = 0, rows: number = 10): Observable<PaginatedAuthorsResponse> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    return this.http.get<ApiV2AuthorsResponse>(`${this.baseUrl}/authors`, { params }).pipe(
      map(response => ({
        authors: response.data.authors.map(a => this.mapApiAuthorToModel(a)),
        totalCount: response.recordCount
      }))
    );
  }

  /**
   * Pridobi posameznega avtorja po ID-ju
   */
  getAuthorById(authorId: string): Observable<Author> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<any>(`${this.baseUrl}/authors/${authorId}`, { params }).pipe(
      map(response => {
        const data = response.data;
        if (!data) {
          throw new Error('No author data in response');
        }
        if (data.authors && Array.isArray(data.authors)) {
          return this.mapApiAuthorToModel(data.authors[0]);
        }
        if (data.author) {
          return this.mapApiAuthorToModel(data.author);
        }
        if (data.authorId) {
          return this.mapApiAuthorToModel(data);
        }
        throw new Error('Could not parse author response');
      })
    );
  }

  /**
   * Mapper za naslove knjig
   */
  private mapApiTitleToModel(apiTitle: ApiV2Title): Title {
    if (!apiTitle) {
      throw new Error('Invalid title data received from API');
    }

    const usdPrice = apiTitle.price?.find(p => p.currencyCode === 'USD')?.amount;
    const priceusa = usdPrice ? usdPrice.toString() : undefined;
    const priceeur = priceusa ? PrhApiService.convertUsdToEur(priceusa) : undefined;
    const isbn = apiTitle.isbn?.toString() || '';

    return {
      isbn,
      isbn10: '',
      titleweb: apiTitle.title || '',
      titleshort: apiTitle.title || '',
      authorweb: apiTitle.author || '',
      author: apiTitle.author || '',
      formatname: apiTitle.format?.description || '',
      formatcode: apiTitle.format?.code || '',
      priceusa,
      priceeur,
      pricecanada: apiTitle.price?.find(p => p.currencyCode === 'CAD')?.amount?.toString(),
      pages: apiTitle.pages?.toString(),
      onsaledate: apiTitle.onsale,
      workid: isbn
    };
  }

  /**
   * Formati, ki niso knjige (za filtriranje)
   */
  private static readonly NON_BOOK_FORMATS = [
    'MU', 'PZ', 'CA', 'GA', 'GI', 'PO', 'ST', 'WL', 'NT', 'CL', 'BX', 'KT'
  ];

  // ===========================================================================
  // ISKANJE NASLOVOV
  // ===========================================================================
  /**
   * Iskanje knjig po kriterijih
   *
   * Vrne Observable - komponenta se mora subscribe-ati
   */
  searchTitles(criteria: TitleSearchCriteria, start: number = 0, rows: number = 50): Observable<TitlesResponse> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    if (criteria.keyword) {
      params = params.set('title', criteria.keyword);
    }
    if (criteria.author) {
      params = params.set('author', criteria.author);
    }
    if (criteria.format) {
      params = params.set('format', criteria.format);
    }

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/titles`, { params }).pipe(
      map(response => {
        let titles = response.data.titles.map(t => this.mapApiTitleToModel(t));

        if (criteria.excludeNonBooks) {
          titles = titles.filter(t =>
            !PrhApiService.NON_BOOK_FORMATS.includes(t.formatcode?.toUpperCase() || '')
          );
        }

        return { title: titles };
      })
    );
  }

  /**
   * Paginirani naslovi
   */
  getTitlesPaginated(start: number = 0, rows: number = 10, format?: string): Observable<PaginatedTitlesResponse> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    if (format) {
      params = params.set('format', format);
    } else {
      params = params.set('format', 'TR');
    }

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/titles`, { params }).pipe(
      map(response => ({
        titles: response.data.titles.map(t => this.mapApiTitleToModel(t)),
        totalCount: response.recordCount
      }))
    );
  }

  /**
   * Pridobi knjigo po ISBN
   */
  getTitleByIsbn(isbn: string): Observable<Title> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<any>(`${this.baseUrl}/titles/${isbn}`, { params }).pipe(
      map(response => {
        const data = response.data;
        if (!data) {
          throw new Error('No title data in response');
        }
        if (data.titles && Array.isArray(data.titles)) {
          return this.mapApiTitleToModel(data.titles[0]);
        }
        if (data.title) {
          return this.mapApiTitleToModel(data.title);
        }
        return this.mapApiTitleToModel(data);
      })
    );
  }

  /**
   * Pridobi vse knjige določenega avtorja
   */
  getTitlesByAuthor(authorId: string, start: number = 0, rows: number = 50): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/authors/${authorId}/titles`, { params }).pipe(
      map(response => ({
        title: response.data.titles.map(t => this.mapApiTitleToModel(t))
      }))
    );
  }

  /**
   * URL za naslovnico knjige
   * Ne vrne Observable - sinhrona metoda
   */
  getCoverImageUrl(isbn: string): string {
    return `https://images.penguinrandomhouse.com/cover/${isbn}`;
  }
}
