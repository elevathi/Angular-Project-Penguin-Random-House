import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';

@Injectable({
  providedIn: 'root'
})
export class PrhApiService {
  private baseUrl = 'https://reststop.randomhouse.com/resources';

  constructor(private http: HttpClient) {}

  // AUTHORS
  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    let params = new HttpParams()
      .set('start', '0')
      .set('max', '20')
      .set('expandLevel', '1');

    if (firstName) params = params.set('firstName', firstName);
    if (lastName) params = params.set('lastName', lastName);

    return this.http.get<AuthorsResponse>(`${this.baseUrl}/authors`, { params });
  }

  getAuthorById(authorId: string): Observable<Author> {
    return this.http.get<Author>(`${this.baseUrl}/authors/${authorId}`);
  }

  // TITLES
  searchTitles(keyword: string): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', '0')
      .set('max', '20')
      .set('expandLevel', '1')
      .set('search', keyword);

    return this.http.get<TitlesResponse>(`${this.baseUrl}/titles`, { params });
  }

  getTitleByIsbn(isbn: string): Observable<Title> {
    return this.http.get<Title>(`${this.baseUrl}/titles/${isbn}`);
  }

  getTitlesByAuthor(authorId: string): Observable<TitlesResponse> {
    const params = new HttpParams()
      .set('start', '0')
      .set('max', '50')
      .set('expandLevel', '1')
      .set('authorid', authorId);

    return this.http.get<TitlesResponse>(`${this.baseUrl}/titles`, { params });
  }

  // COVER IMAGE URL
  getCoverImageUrl(isbn: string): string {
    return `https://reststop.randomhouse.com/resources/titles/${isbn}`;
  }
}