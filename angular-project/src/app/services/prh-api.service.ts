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
  private baseUrl = 'https://reststop.randomhouse.com/resources';
  private apiKey = environment.prhApiKey;

  constructor(private http: HttpClient) {}

  // AUTHORS
  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    let params = new HttpParams()
      .set('start', '0')
      .set('max', '20')
      .set('expandLevel', '1')
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
      .set('max', '20')
      .set('expandLevel', '1')
      .set('search', keyword)
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
      .set('max', '50')
      .set('expandLevel', '1')
      .set('authorid', authorId)
      .set('api_key', this.apiKey);

    return this.http.get<TitlesResponse>(`${this.baseUrl}/titles`, { params });
  }

  // COVER IMAGE URL
  getCoverImageUrl(isbn: string): string {
    return `https://reststop.randomhouse.com/resources/titles/${isbn}?api_key=${this.apiKey}`;
  }
}