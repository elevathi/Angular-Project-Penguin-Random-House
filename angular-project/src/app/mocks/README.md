# Mock Data for Development

This directory contains mock data that simulates the Penguin Random House API responses. Use this while waiting for your real API key.

## Files

- **mock-authors.data.ts** - 5 mock authors (Stephen King, J.K. Rowling, George R.R. Martin, Agatha Christie, Neil Gaiman)
- **mock-titles.data.ts** - 12 mock book titles from the above authors
- **mock-prh-api.service.ts** - Mock API service that simulates network delay (500ms) and returns mock data

## Mock Data Includes

### Authors
- Stephen King (Horror)
- J.K. Rowling (Fantasy)
- George R.R. Martin (Epic Fantasy)
- Agatha Christie (Mystery)
- Neil Gaiman (Contemporary Fantasy)

### Titles
- The Shining, It, The Stand (Stephen King)
- Harry Potter series (J.K. Rowling)
- A Song of Ice and Fire series (George R.R. Martin)
- And Then There Were None, Murder on the Orient Express (Agatha Christie)
- American Gods, Coraline (Neil Gaiman)

## How to Use

The mock data is automatically used when `useMockData: true` in your environment config.

### Enable Mock Data (Development)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  useMockData: true,  // ← Mock data enabled
  prhApiKey: 'YOUR_API_KEY_HERE'
};
```

### Disable Mock Data (Use Real API)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  useMockData: false,  // ← Real API will be used
  prhApiKey: 'your-real-api-key'
};
```

## Features

- ✅ Simulates network latency (500ms delay)
- ✅ Supports all API methods:
  - `searchAuthors(firstName?, lastName?)`
  - `getAuthorById(authorId)`
  - `searchTitles(keyword)`
  - `getTitleByIsbn(isbn)`
  - `getTitlesByAuthor(authorId)`
  - `getCoverImageUrl(isbn)` - Returns placeholder images
- ✅ Proper filtering and search functionality
- ✅ Type-safe with TypeScript interfaces
- ✅ Matches real API response structure

## Testing Searches

Try these searches in the application:

**Author Search:**
- First Name: "Stephen" → Returns Stephen King
- Last Name: "King" → Returns Stephen King
- Last Name: "Gaiman" → Returns Neil Gaiman

**Title Search:**
- "Harry Potter" → Returns Harry Potter books
- "Game" → Returns Game of Thrones
- "Horror" → Returns horror books

## Adding More Mock Data

To add more mock data, simply edit:
- `mock-authors.data.ts` - Add to `MOCK_AUTHORS` array
- `mock-titles.data.ts` - Add to `MOCK_TITLES` array

Make sure the data matches the TypeScript interfaces in `models/`.
