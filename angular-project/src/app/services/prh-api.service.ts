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
import { Observable, throwError, of, from } from 'rxjs';
import { map, catchError, mergeMap, concatMap, delay, toArray } from 'rxjs/operators';
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
  // CACHING STRATEGY
  // ===========================================================================
  private authorsCache: Author[] | null = null;
  private titlesCache: Title[] | null = null;
  private authorsCacheLoading = false;
  private titlesCacheLoading = false;

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

  // ===========================================================================
  // CACHE LOADING METHODS
  // ===========================================================================

  /**
   * Preload both authors and titles cache in the background
   * Loads authors FIRST, then titles (fully sequential to avoid overwhelming API)
   *
   * Usage in component:
   *   constructor(private prhApiService: PrhApiService) {
   *     this.prhApiService.preloadCaches();
   *   }
   */
  preloadCaches(): void {
    console.log('🚀 Preloading caches in background...');
    console.log('📋 Step 1: Loading authors first...');

    // Load authors FIRST, then titles (fully sequential)
    this.loadAllAuthorsIntoCache().subscribe({
      next: () => {
        console.log('✅ Authors cache preloaded');
        console.log('📋 Step 2: Now loading titles...');

        // Only start titles after authors complete
        this.loadAllTitlesIntoCache().subscribe({
          next: () => console.log('✅ Titles cache preloaded'),
          error: (err) => console.error('❌ Error preloading titles:', err)
        });
      },
      error: (err) => {
        console.error('❌ Error preloading authors:', err);
        console.log('⚠️ Skipping titles cache due to authors error');
      }
    });
  }

  /**
   * Load all authors into cache (103,340 authors)
   * Uses SEQUENTIAL batch loading with proper waiting between batches
   */
  loadAllAuthorsIntoCache(): Observable<void> {
    if (this.authorsCache) {
      console.log('✅ Authors cache already loaded:', this.authorsCache.length, 'authors');
      return of(void 0);
    }

    if (this.authorsCacheLoading) {
      console.log('⏳ Authors cache already loading...');
      return of(void 0);
    }

    this.authorsCacheLoading = true;
    console.log('🔄 Loading all authors into cache (sequential batches with delays)...');

    // Load in batches of 5000 (21 batches for 103,340 authors)
    const batchSize = 500; // Reduced batch size from 5000 to 500
    const totalAuthors = 103340;
    const batches = Math.ceil(totalAuthors / batchSize);

    // Create array of batch numbers [0, 1, 2, ..., 20]
    const batchNumbers = Array.from({ length: batches }, (_, i) => i);

    // Use concatMap to ensure each batch waits for previous to complete
    return from(batchNumbers).pipe(
      concatMap(i => {
        const start = i * batchSize;
        const batchNumber = i + 1;

        const params = new HttpParams()
          .set('start', start.toString())
          .set('rows', batchSize.toString())
          .set('api_key', this.apiKey);

        console.log(`🔄 Loading batch ${batchNumber}/${batches}...`);

        return this.http.get<ApiV2AuthorsResponse>(`${this.baseUrl}/domains/PRH.US/authors`, { params }).pipe(
          delay(500), // Wait 500ms after each request
          map(response => {
            const authors = response.data.authors.map(a => this.mapApiAuthorToModel(a));
            console.log(`📦 Loaded batch ${batchNumber}/${batches}: ${authors.length} authors`);
            return authors;
          }),
          catchError((err) => {
            console.error(`❌ Error loading batch ${batchNumber}:`, err.status, err.statusText);
            return of([]);
          })
        );
      }),
      toArray(), // Collect all batches into an array
      map(batchesArray => {
        // Flatten array of arrays into single array
        const allAuthors = batchesArray.flat();
        this.authorsCache = allAuthors;
        this.authorsCacheLoading = false;
        console.log('✅ All authors loaded into cache:', this.authorsCache.length, 'authors');
      }),
      catchError((err) => {
        console.error('❌ Fatal error loading authors cache:', err);
        this.authorsCacheLoading = false;
        this.authorsCache = [];
        return of(void 0);
      })
    );
  }

  /**
   * Load all titles into cache (96,282 titles)
   * Uses SEQUENTIAL batch loading with proper waiting between batches
   */
  loadAllTitlesIntoCache(): Observable<void> {
    if (this.titlesCache) {
      console.log('✅ Titles cache already loaded:', this.titlesCache.length, 'titles');
      return of(void 0);
    }

    if (this.titlesCacheLoading) {
      console.log('⏳ Titles cache already loading...');
      return of(void 0);
    }

    this.titlesCacheLoading = true;
    console.log('🔄 Loading all titles into cache (sequential batches with delays)...');

    // Load in batches of 5000 (20 batches for 96,282 titles)
    const batchSize = 500; // Reduced batch size from 5000 to 500
    const totalTitles = 96282;
    const batches = Math.ceil(totalTitles / batchSize);

    // Create array of batch numbers [0, 1, 2, ..., 19]
    const batchNumbers = Array.from({ length: batches }, (_, i) => i);

    // Use concatMap to ensure each batch waits for previous to complete
    return from(batchNumbers).pipe(
      concatMap(i => {
        const start = i * batchSize;
        const batchNumber = i + 1;

        const params = new HttpParams()
          .set('start', start.toString())
          .set('rows', batchSize.toString())
          .set('api_key', this.apiKey);

        console.log(`🔄 Loading batch ${batchNumber}/${batches}...`);

        return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/domains/PRH.US/titles`, { params }).pipe(
          delay(500), // Wait 500ms after each request
          map(response => {
            const titles = response.data.titles.map(t => this.mapApiTitleToModel(t));
            console.log(`📦 Loaded batch ${batchNumber}/${batches}: ${titles.length} titles`);
            return titles;
          }),
          catchError((err) => {
            console.error(`❌ Error loading batch ${batchNumber}:`, err.status, err.statusText);
            return of([]);
          })
        );
      }),
      toArray(), // Collect all batches into an array
      map(batchesArray => {
        // Flatten array of arrays into single array
        const allTitles = batchesArray.flat();
        this.titlesCache = allTitles;
        this.titlesCacheLoading = false;
        console.log('✅ All titles loaded into cache:', this.titlesCache.length, 'titles');
      }),
      catchError((err) => {
        console.error('❌ Fatal error loading titles cache:', err);
        this.titlesCacheLoading = false;
        this.titlesCache = [];
        return of(void 0);
      })
    );
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
  /**
   * Iskanje avtorjev po imenu
   * 
   * API Endpoint: GET /domains/{domain}/authors
   * 
   * PARAMETRI:
   * - start: indeks prve vrstice (privzeto 0)
   * - rows: število vrnjenih rezultatov (privzeto 10, tukaj 200)
   * - authorLastInitial: filtriranje po začetnici priimka
   * - sort: sortiranje ('id', 'authorLast', 'random')
   * 
   * @param firstName - Ime avtorja (opcijsko)
   * @param lastName - Priimek avtorja (opcijsko, filtrira po začetnici)
   * @returns Observable z avtorji, ki se ujemajo s kriteriji
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
    console.log('👤 searchAuthors called - firstName:', firstName, 'lastName:', lastName);

    // Use cache if available, otherwise load it first
    if (!this.authorsCache) {
      console.log('📥 Cache not loaded, loading all authors first...');
      return this.loadAllAuthorsIntoCache().pipe(
        map(() => this.searchAuthorsInCache(firstName, lastName))
      );
    }

    // Search in cache
    return of(this.searchAuthorsInCache(firstName, lastName));
  }

  /**
   * Search authors in cache (instant search across all 103k+ authors)
   */
  private searchAuthorsInCache(firstName?: string, lastName?: string): AuthorsResponse {
    if (!this.authorsCache) {
      return { author: [] };
    }

    console.log('🔍 Searching in cache of', this.authorsCache.length, 'authors');

    const firstNameLower = firstName?.toLowerCase() || '';
    const lastNameLower = lastName?.toLowerCase() || '';

    let authors = [...this.authorsCache];

    // Filter by last name
    if (lastNameLower) {
      const beforeFilter = authors.length;
      authors = authors.filter(a =>
        a.authorlastlc?.startsWith(lastNameLower) ||
        a.authorlast?.toLowerCase().startsWith(lastNameLower)
      );
      console.log('🔎 Last name filter:', beforeFilter, '→', authors.length, 'authors');
    }

    // Filter by first name
    if (firstNameLower) {
      const beforeFilter = authors.length;
      authors = authors.filter(a =>
        a.authorfirstlc?.startsWith(firstNameLower) ||
        a.authorfirst?.toLowerCase().startsWith(firstNameLower)
      );
      console.log('🔎 First name filter:', beforeFilter, '→', authors.length, 'authors');
    }

    console.log('✅ Final author result:', authors.length, 'authors');
    return { author: authors };
  }

  /**
   * Paginirani avtorji s skupnim številom
   * 
   * API Endpoint: GET /domains/{domain}/authors
   * 
   * Vrne avtorje z paginacijo in skupnim številom dostopnih avtorjev.
   * Primerno za browse/listing funkcionalno.
   * 
   * @param start - Začetni indeks (privzeto 0)
   * @param rows - Število avtorjev na stran (privzeto 10)
   * @returns Observable s paginiranimi avtorji in skupnim številom
   */
  getAuthorsPaginated(start: number = 0, rows: number = 10): Observable<PaginatedAuthorsResponse> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    return this.http.get<ApiV2AuthorsResponse>(`${this.baseUrl}/domains/PRH.US/authors`, { params }).pipe(
      map(response => ({
        authors: response.data.authors.map(a => this.mapApiAuthorToModel(a)),
        totalCount: response.recordCount
      }))
    );
  }

  /**
   * Pridobi posameznega avtorja po ID-ju
   */
  /**
   * Pridobi podrobnosti avtorja po ID
   * 
   * API Endpoint: GET /domains/{domain}/authors/{authorId}
   * 
   * Vrne detaljne informacije o avtorju, vključno z njegovimi deli.
   * 
   * @param authorId - ID avtorja
   * @param domain - Domenski filter (privzeto 'PRH.US')
   * @returns Observable z avtorjevimi podatki
   */
  getAuthorById(authorId: string, domain: string = 'PRH.US'): Observable<Author> {
    let params = new HttpParams()
      .set('api_key', this.apiKey);

    return this.http.get<any>(`${this.baseUrl}/domains/${domain}/authors/${authorId}`, { params }).pipe(
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
        if (data.authorId || data.id) {
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
   * NOTE: PRH API ne podpira iskanja po besedilu naslova.
   *
   * STRATEGIJA:
   * - Če je podan author, najprej poišči avtorja in nato njegove knjige
   * - Če je podan ISBN (samo številke), uporabi isbn parameter
   * - Za iskanje po besedilu naslova uporabite client-side filtering
   *
   * Vrne Observable - komponenta se mora subscribe-ati
   */
  searchTitles(criteria: TitleSearchCriteria, start: number = 0, rows: number = 1000): Observable<TitlesResponse> {
    console.log('🔍 searchTitles called with criteria:', criteria);

    // If searching by author name, use the two-step process (author search + filter)
    if (criteria.author && criteria.author.trim()) {
      console.log('📚 Using two-step author search for:', criteria.author);
      return this.searchTitlesByAuthorNameCached(criteria);
    }

    // Use cache if available, otherwise load it first
    if (!this.titlesCache) {
      console.log('📥 Cache not loaded, loading all titles first...');
      return this.loadAllTitlesIntoCache().pipe(
        map(() => this.searchTitlesInCache(criteria))
      );
    }

    // Search in cache
    return of(this.searchTitlesInCache(criteria));
  }

  /**
   * Search titles in cache (instant search across all 96k+ titles)
   */
  private searchTitlesInCache(criteria: TitleSearchCriteria): TitlesResponse {
    if (!this.titlesCache) {
      return { title: [] };
    }

    console.log('🔍 Searching in cache of', this.titlesCache.length, 'titles');

    let titles = [...this.titlesCache];

    // Filter by ISBN (exact match)
    if (criteria.keyword && /^\d+$/.test(criteria.keyword)) {
      console.log('🔢 Searching by ISBN:', criteria.keyword);
      const beforeFilter = titles.length;
      titles = titles.filter(t => t.isbn === criteria.keyword);
      console.log('🔎 ISBN filter:', beforeFilter, '→', titles.length, 'titles');
    }
    // Filter by keyword (title search)
    else if (criteria.keyword && criteria.keyword.trim()) {
      const keywordLower = criteria.keyword.toLowerCase();
      const beforeFilter = titles.length;
      titles = titles.filter(t =>
        t.titleweb?.toLowerCase().includes(keywordLower) ||
        t.titleshort?.toLowerCase().includes(keywordLower)
      );
      console.log('🔎 Keyword filter:', beforeFilter, '→', titles.length, 'titles');
    }

    // Filter by format
    if (criteria.format) {
      const beforeFilter = titles.length;
      titles = titles.filter(t => t.formatcode === criteria.format);
      console.log('📖 Format filter:', beforeFilter, '→', titles.length, 'titles');
    }

    // Exclude non-books
    if (criteria.excludeNonBooks) {
      const beforeFilter = titles.length;
      titles = titles.filter(t =>
        !PrhApiService.NON_BOOK_FORMATS.includes(t.formatcode?.toUpperCase() || '')
      );
      console.log('📚 Non-book filter:', beforeFilter, '→', titles.length, 'titles');
    }

    console.log('✅ Final result:', titles.length, 'titles');
    return { title: titles };
  }

  /**
   * Search titles by author name using cache (two-step process)
   * 1. Find authors matching the name
   * 2. Filter titles by those authors
   */
  private searchTitlesByAuthorNameCached(criteria: TitleSearchCriteria): Observable<TitlesResponse> {
    const authorParts = (criteria.author || '').trim().split(/\s+/);
    const firstName = authorParts.length > 1 ? authorParts[0] : '';
    const lastName = authorParts.length > 1 ? authorParts[authorParts.length - 1] : authorParts[0];

    console.log('👤 Step 1: Searching for author - firstName:', firstName, 'lastName:', lastName);

    // Step 1: Find authors
    return this.searchAuthors(firstName, lastName).pipe(
      mergeMap(authorsResponse => {
        const authors = authorsResponse.author;
        console.log('👥 Step 1 Result: Found', authors?.length || 0, 'authors');

        if (!authors || authors.length === 0) {
          console.log('❌ No authors found');
          return of({ title: [] });
        }

        // Get author names for filtering
        const authorNames = authors.map(a => a.authordisplay?.toLowerCase() || '');
        console.log('📝 Searching for titles by these authors:', authorNames.slice(0, 5));

        // Step 2: Load titles cache if needed, then filter
        if (!this.titlesCache) {
          console.log('📥 Loading titles cache...');
          return this.loadAllTitlesIntoCache().pipe(
            map(() => this.filterTitlesByAuthors(authorNames, criteria))
          );
        }

        return of(this.filterTitlesByAuthors(authorNames, criteria));
      })
    );
  }

  /**
   * Filter titles by author names in cache
   */
  private filterTitlesByAuthors(authorNames: string[], criteria: TitleSearchCriteria): TitlesResponse {
    if (!this.titlesCache) {
      return { title: [] };
    }

    console.log('📚 Step 2: Filtering titles by', authorNames.length, 'authors');

    let titles = this.titlesCache.filter(t => {
      const titleAuthor = t.authorweb?.toLowerCase() || '';
      return authorNames.some(name => titleAuthor.includes(name));
    });

    console.log('📦 Found', titles.length, 'titles by these authors');

    // Apply additional filters
    if (criteria.keyword && criteria.keyword.trim()) {
      const keywordLower = criteria.keyword.toLowerCase();
      const beforeFilter = titles.length;
      titles = titles.filter(t =>
        t.titleweb?.toLowerCase().includes(keywordLower) ||
        t.titleshort?.toLowerCase().includes(keywordLower)
      );
      console.log('🔎 Keyword filter:', beforeFilter, '→', titles.length, 'titles');
    }

    if (criteria.format) {
      const beforeFilter = titles.length;
      titles = titles.filter(t => t.formatcode === criteria.format);
      console.log('📖 Format filter:', beforeFilter, '→', titles.length, 'titles');
    }

    if (criteria.excludeNonBooks) {
      const beforeFilter = titles.length;
      titles = titles.filter(t =>
        !PrhApiService.NON_BOOK_FORMATS.includes(t.formatcode?.toUpperCase() || '')
      );
      console.log('📚 Non-book filter:', beforeFilter, '→', titles.length, 'titles');
    }

    console.log('✅ Final result:', titles.length, 'titles');
    return { title: titles };
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

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/domains/PRH.US/titles`, { params }).pipe(
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
    return this.http.get<any>(`${this.baseUrl}/domains/PRH.US/titles/${isbn}`, { params }).pipe(
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
   *
   * API Endpoint: GET /domains/{domain}/authors/{authorId}/titles
   *
   * @param authorId - ID avtorja
   * @param start - Začetni indeks (privzeto 0)
   * @param rows - Število vrnjenih rezultatov (privzeto 50)
   * @param domain - Domenski filter (privzeto 'PRH.US')
   * @returns Observable z naslovom avtorjevih del
   */
  getTitlesByAuthor(authorId: string, start: number = 0, rows: number = 50, domain: string = 'PRH.US'): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/domains/${domain}/authors/${authorId}/titles`, { params }).pipe(
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
