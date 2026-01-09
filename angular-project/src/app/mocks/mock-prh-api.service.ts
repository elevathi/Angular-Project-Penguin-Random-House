import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Author, AuthorsResponse } from '../models/author.model';
import { Title, TitlesResponse } from '../models/title.model';
import { MOCK_AUTHORS, getMockAuthorsResponse } from './mock-authors.data';
import { MOCK_TITLES, getMockTitlesResponse } from './mock-titles.data';

@Injectable({
  providedIn: 'root'
})
export class MockPrhApiService {
  private readonly DELAY_MS = 500; // Simulate network delay

  // AUTHORS
  searchAuthors(firstName?: string, lastName?: string): Observable<AuthorsResponse> {
    let filteredAuthors = [...MOCK_AUTHORS];

    // If no search criteria, return all authors
    if (!firstName && !lastName) {
      return of(getMockAuthorsResponse(filteredAuthors)).pipe(delay(this.DELAY_MS));
    }

    if (firstName) {
      filteredAuthors = filteredAuthors.filter(author =>
        author.authorfirst?.toLowerCase().includes(firstName.toLowerCase())
      );
    }

    if (lastName) {
      filteredAuthors = filteredAuthors.filter(author =>
        author.authorlast?.toLowerCase().includes(lastName.toLowerCase())
      );
    }

    return of(getMockAuthorsResponse(filteredAuthors)).pipe(delay(this.DELAY_MS));
  }

  getAuthorById(authorId: string): Observable<Author> {
    const author = MOCK_AUTHORS.find(a => a.authorid === authorId);
    if (!author) {
      throw new Error('Author with ID ' + authorId + ' not found');
    }
    return of(author).pipe(delay(this.DELAY_MS));
  }

  // TITLES
  searchTitles(keyword: string): Observable<TitlesResponse> {
    // If no keyword or empty string, return all titles
    if (!keyword || keyword.trim() === '') {
      return of(getMockTitlesResponse(MOCK_TITLES)).pipe(delay(this.DELAY_MS));
    }

    const searchTerm = keyword.toLowerCase();

    const filteredTitles = MOCK_TITLES.filter(title => {
      const titleText = title.titleweb.toLowerCase();
      const authorText = title.authorweb?.toLowerCase() || '';
      const categoryText = title.subjectcategorydescription1?.toLowerCase() || '';

      // Match if:
      // 1. Title starts with the search term
      // 2. Any word in title starts with the search term
      // 3. Author name starts with or contains the search term as a word
      // 4. Category starts with or contains the search term as a word

      const titleWords = titleText.split(/\s+/);
      const authorWords = authorText.split(/\s+/);
      const categoryWords = categoryText.split(/\s+/);

      return titleText.startsWith(searchTerm) ||
             titleWords.some(word => word.startsWith(searchTerm)) ||
             authorText.startsWith(searchTerm) ||
             authorWords.some(word => word.startsWith(searchTerm)) ||
             categoryText.startsWith(searchTerm) ||
             categoryWords.some(word => word.startsWith(searchTerm));
    });

    return of(getMockTitlesResponse(filteredTitles)).pipe(delay(this.DELAY_MS));
  }

  getTitleByIsbn(isbn: string): Observable<Title> {
    const title = MOCK_TITLES.find(t => t.isbn === isbn);
    if (!title) {
      throw new Error('Title with ISBN ' + isbn + ' not found');
    }
    return of(title).pipe(delay(this.DELAY_MS));
  }

  getTitlesByAuthor(authorId: string): Observable<TitlesResponse> {
    // Match titles by author name since authorid is not in the Title model
    const author = MOCK_AUTHORS.find(a => a.authorid === authorId);
    if (!author) {
      return of(getMockTitlesResponse([])).pipe(delay(this.DELAY_MS));
    }
    const filteredTitles = MOCK_TITLES.filter(title =>
      title.authorweb === author.authordisplay || title.author === author.authordisplay
    );
    return of(getMockTitlesResponse(filteredTitles)).pipe(delay(this.DELAY_MS));
  }

  // COVER IMAGE URL
  getCoverImageUrl(isbn: string): string {
    // Return a simple SVG data URI for mock data to avoid network requests
    const title = MOCK_TITLES.find(t => t.isbn === isbn);
    const bookTitle = title ? title.titleweb.substring(0, 30) : 'Book Cover';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
      <rect width="300" height="450" fill="#3b82f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${bookTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
}
