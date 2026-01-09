import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';
import { environment } from '../../environments/environment';

// API v2 response interfaces
interface ApiV2Author {
  authorId: number;
  display: string;
  first: string;
  last: string;
}

interface ApiV2AuthorsResponse {
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
  data: {
    titles: ApiV2Title[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrhApiService {
  private baseUrl = '/api'; // Using proxy to avoid CORS issues
  private apiKey = environment.prhApiKey;
  private static readonly USD_TO_EUR_RATE = 0.92;

  constructor(private http: HttpClient) {}

  // Currency conversion utility
  static convertUsdToEur(priceUsd: string | undefined): string {
    if (!priceUsd) return '0.00';
    const usdAmount = parseFloat(priceUsd);
    if (isNaN(usdAmount)) return '0.00';
    const eurAmount = usdAmount * PrhApiService.USD_TO_EUR_RATE;
    return eurAmount.toFixed(2);
  }

  // Map API v2 author to our model
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

  // AUTHORS
  searchAuthors(firstName?: string, lastName?: string, start: number = 0, rows: number = 10): Observable<AuthorsResponse> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('api_key', this.apiKey);

    if (firstName) params = params.set('firstName', firstName);
    if (lastName) params = params.set('lastName', lastName);

    return this.http.get<ApiV2AuthorsResponse>(`${this.baseUrl}/authors`, { params }).pipe(
      map(response => ({
        author: response.data.authors.map(a => this.mapApiAuthorToModel(a))
      }))
    );
  }

  getAuthorById(authorId: string): Observable<Author> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Author>(`${this.baseUrl}/authors/${authorId}`, { params });
  }

  // Map API v2 title to our model
  private mapApiTitleToModel(apiTitle: ApiV2Title): Title {
    const usdPrice = apiTitle.price?.find(p => p.currencyCode === 'USD')?.amount;
    const priceusa = usdPrice ? usdPrice.toString() : undefined;
    const priceeur = priceusa ? PrhApiService.convertUsdToEur(priceusa) : undefined;

    return {
      isbn: apiTitle.isbn.toString(),
      isbn10: '', // v2 API doesn't provide ISBN-10 in list view
      titleweb: apiTitle.title,
      titleshort: apiTitle.title,
      authorweb: apiTitle.author,
      author: apiTitle.author,
      formatname: apiTitle.format?.description || '',
      formatcode: apiTitle.format?.code || '',
      priceusa,
      priceeur,
      pricecanada: apiTitle.price?.find(p => p.currencyCode === 'CAD')?.amount.toString(),
      pages: apiTitle.pages?.toString(),
      onsaledate: apiTitle.onsale,
      workid: apiTitle.isbn.toString() // Using ISBN as workId fallback
    };
  }

  // TITLES
  searchTitles(keyword: string, start: number = 0, rows: number = 10): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('rows', rows.toString())
      .set('keyword', keyword)
      .set('api_key', this.apiKey);

    return this.http.get<ApiV2TitlesResponse>(`${this.baseUrl}/titles`, { params }).pipe(
      map(response => ({
        title: response.data.titles.map(t => this.mapApiTitleToModel(t))
      }))
    );
  }

  getTitleByIsbn(isbn: string): Observable<Title> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<any>(`${this.baseUrl}/titles/${isbn}`, { params }).pipe(
      map(response => this.mapApiTitleToModel(response.data))
    );
  }

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

  // COVER IMAGE URL
  // API v2 provides cover images through the Penguin Random House CDN
  getCoverImageUrl(isbn: string): string {
    return `https://images.penguinrandomhouse.com/cover/${isbn}`;
  }
}