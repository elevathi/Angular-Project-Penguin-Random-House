/**
 * Mock API Service - nadomestna storitev za testiranje brez pravega API-ja
 */
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';
import { TitleSearchCriteria } from '../components/search-form/search-form.component';
import { PaginatedAuthorsResponse, PaginatedTitlesResponse } from '../services/prh-api.service';
import { MOCK_AUTHORS, getMockAuthorsResponse } from './mock-authors.data';
import { MOCK_TITLES, getMockTitlesResponse } from './mock-titles.data';

@Injectable({
  providedIn: 'root'
})
export class MockPrhApiService {
  private readonly DELAY_MS = 300; // Simulate network delay

  // Currency conversion (same as real service)
  static convertUsdToEur(priceUsd: string | undefined): string {
    if (!priceUsd) return '0.00';
    const usdAmount = parseFloat(priceUsd);
    if (isNaN(usdAmount)) return '0.00';
    const eurAmount = usdAmount * 0.92;
    return eurAmount.toFixed(2);
  }

  // =========================================================================
  // AUTHORS
  // =========================================================================

  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    let filteredAuthors = [...MOCK_AUTHORS];

    if (firstName) {
      const search = firstName.toLowerCase();
      filteredAuthors = filteredAuthors.filter(author =>
        author.authorfirst?.toLowerCase().startsWith(search)
      );
    }

    if (lastName) {
      const search = lastName.toLowerCase();
      filteredAuthors = filteredAuthors.filter(author =>
        author.authorlast?.toLowerCase().startsWith(search)
      );
    }

    return of(getMockAuthorsResponse(filteredAuthors)).pipe(delay(this.DELAY_MS));
  }

  getAuthorsPaginated(start: number = 0, rows: number = 10): Observable<PaginatedAuthorsResponse> {
    const paginatedAuthors = MOCK_AUTHORS.slice(start, start + rows);
    return of({
      authors: paginatedAuthors,
      totalCount: MOCK_AUTHORS.length
    }).pipe(delay(this.DELAY_MS));
  }

  getAuthorById(authorId: string): Observable<Author> {
    const author = MOCK_AUTHORS.find(a => a.authorid === authorId);
    if (!author) {
      throw new Error('Author with ID ' + authorId + ' not found');
    }
    return of(author).pipe(delay(this.DELAY_MS));
  }

  // =========================================================================
  // TITLES
  // =========================================================================

  searchTitles(criteria: TitleSearchCriteria, start: number = 0, rows: number = 50): Observable<TitlesResponse> {
    let filteredTitles = [...MOCK_TITLES];

    // Filter by keyword (title)
    if (criteria.keyword) {
      const search = criteria.keyword.toLowerCase();
      filteredTitles = filteredTitles.filter(title =>
        title.titleweb?.toLowerCase().includes(search) ||
        title.titleshort?.toLowerCase().includes(search)
      );
    }

    // Filter by author
    if (criteria.author) {
      const search = criteria.author.toLowerCase();
      filteredTitles = filteredTitles.filter(title =>
        title.authorweb?.toLowerCase().includes(search) ||
        title.author?.toLowerCase().includes(search)
      );
    }

    // Filter by format
    if (criteria.format) {
      filteredTitles = filteredTitles.filter(title =>
        title.formatcode === criteria.format
      );
    }

    // Exclude non-books
    if (criteria.excludeNonBooks) {
      const nonBookFormats = ['MU', 'PZ', 'CA', 'GA', 'GI', 'PO', 'ST', 'WL', 'NT', 'CL', 'BX', 'KT'];
      filteredTitles = filteredTitles.filter(title =>
        !nonBookFormats.includes(title.formatcode?.toUpperCase() || '')
      );
    }

    // Apply pagination
    const paginatedTitles = filteredTitles.slice(start, start + rows);

    return of(getMockTitlesResponse(paginatedTitles)).pipe(delay(this.DELAY_MS));
  }

  getTitlesPaginated(start: number = 0, rows: number = 10, format?: string): Observable<PaginatedTitlesResponse> {
    let filteredTitles = [...MOCK_TITLES];

    if (format) {
      filteredTitles = filteredTitles.filter(title => title.formatcode === format);
    }

    const paginatedTitles = filteredTitles.slice(start, start + rows);

    return of({
      titles: paginatedTitles,
      totalCount: filteredTitles.length
    }).pipe(delay(this.DELAY_MS));
  }

  getTitleByIsbn(isbn: string): Observable<Title> {
    const title = MOCK_TITLES.find(t => t.isbn === isbn);
    if (!title) {
      throw new Error('Title with ISBN ' + isbn + ' not found');
    }
    return of(title).pipe(delay(this.DELAY_MS));
  }

  getTitlesByAuthor(authorId: string, start: number = 0, rows: number = 50): Observable<TitlesResponse> {
    const author = MOCK_AUTHORS.find(a => a.authorid === authorId);
    if (!author) {
      return of(getMockTitlesResponse([])).pipe(delay(this.DELAY_MS));
    }

    const filteredTitles = MOCK_TITLES.filter(title =>
      title.authorweb?.toLowerCase() === author.authordisplay?.toLowerCase() ||
      title.author?.toLowerCase() === author.authordisplay?.toLowerCase()
    );

    const paginatedTitles = filteredTitles.slice(start, start + rows);

    return of(getMockTitlesResponse(paginatedTitles)).pipe(delay(this.DELAY_MS));
  }

  // =========================================================================
  // COVER IMAGE URL
  // =========================================================================

  getCoverImageUrl(isbn: string): string {
    // Return a simple SVG data URI for mock data
    const title = MOCK_TITLES.find(t => t.isbn === isbn);
    const bookTitle = title ? title.titleweb.substring(0, 20) : 'Book';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
      <rect width="300" height="450" fill="#3b82f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${bookTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
}
