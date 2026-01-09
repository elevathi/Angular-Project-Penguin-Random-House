import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';
import { environment } from '../../environments/environment';

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

  // AUTHORS
  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    let params = new HttpParams()
      .set('start', '0')
      .set('rows', '20')
      .set('api_key', this.apiKey);

    if (firstName) params = params.set('firstName', firstName);
    if (lastName) params = params.set('lastName', lastName);

    return this.http.get<AuthorsResponse>(`${this.baseUrl}/authors`, { params });
  }

  getAuthorById(authorId: string): Observable<Author> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Author>(`${this.baseUrl}/authors/${authorId}`, { params });
  }

  // TITLES
  searchTitles(keyword: string): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', '0')
      .set('rows', '20')
      .set('keyword', keyword)
      .set('api_key', this.apiKey);

    return this.http.get<TitlesResponse>(`${this.baseUrl}/titles`, { params });
  }

  getTitleByIsbn(isbn: string): Observable<Title> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Title>(`${this.baseUrl}/titles/${isbn}`, { params });
  }

  getTitlesByAuthor(authorId: string): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', '0')
      .set('rows', '50')
      .set('authorId', authorId)
      .set('api_key', this.apiKey);

    return this.http.get<TitlesResponse>(`${this.baseUrl}/titles`, { params });
  }

  // COVER IMAGE URL
  // Note: This returns the title resource URL. To get cover images, you may need to
  // parse the response and extract cover data from the title object.
  getCoverImageUrl(isbn: string): string {
    return `/api/titles/${isbn}?api_key=${this.apiKey}`;
  }
}