# Angular PRH Catalog - Junior Developer Guide

## Project Overview

This is an Angular 21 app for browsing Penguin Random House's book catalog. It uses **standalone components** (no NgModules), **signals** for reactive state, and integrates with the PRH API v2.

---

## Folder Structure

```
src/app/
├── components/          # Reusable UI building blocks
├── pages/               # Route-based views (what users see)
├── services/            # Business logic & API calls
├── models/              # TypeScript interfaces (data shapes)
├── guards/              # Route protection
├── directives/          # Custom element behaviors
├── interceptors/        # HTTP request/response middleware
└── mocks/               # Test data for development
```

---

## Components (Reusable UI Blocks)

### `components/navbar/`
The top navigation bar - always visible. Shows:
- Logo (links to search)
- Nav links (only when logged in)
- Username display
- Logout button

### `components/search-form/`
The search input form with two modes:
- **Author search**: First name + Last name fields
- **Title search**: Keyword + Author filter + Format dropdown + "Exclude non-books" checkbox

Emits search criteria to parent via `@Output()` events.

### `components/author-card/`
Displays an author in a card:
- Name, ID, bio preview (150 chars)
- Clickable → navigates to author detail
- Hover effect (light blue)

### `components/title-card/`
Displays a book in a card:
- Cover image (with fallback placeholder)
- Title, author, format badge
- Price in EUR (converted from USD)
- Clickable → navigates to title detail

### `components/pagination/`
Page navigation with:
- Previous/Next buttons
- Page numbers with smart ellipsis (1 ... 5 6 7 ... 100)
- "Go to page" input for jumping

### `components/loader/`
Loading spinner with customizable message and height.

---

## Pages (Routes)

### `pages/login/` → `/login`
Simple login form. Any username (3+ chars) and password (4+ chars) works (mock auth).

### `pages/search/` → `/search`
**The main hub** with 4 tabs:
1. **Išči avtorje** - Search authors by name
2. **Išči naslove** - Search titles by keyword
3. **Avtorji** - Browse all authors (paginated)
4. **Vsi naslovi** - Browse all titles (paginated)

Also has "I'm Feeling Lucky" button for random book.

### `pages/author-detail/` → `/author/:authorid`
Shows full author info + all their books.

### `pages/title-detail/` → `/title/:isbn`
Shows full book details: cover, description, author bio, metadata.

### `pages/not-found/` → `/**`
404 page for invalid routes.

---

## Services (Business Logic)

### `services/auth.service.ts`
Handles login/logout state using **Angular Signals**:

```typescript
// Key properties (reactive)
currentUser: Signal<User | null>
isLoggedIn: Signal<boolean>

// Key methods
login(credentials): boolean   // Validates & stores token in localStorage
logout(): void               // Clears storage & signals
getToken(): string | null    // Gets JWT from storage
```

### `services/prh-api.service.ts`
**The main API service** - talks to PRH API v2:

```typescript
// Author methods
searchAuthors(firstName?, lastName?)     // Search by name
getAuthorsPaginated(start, rows)         // Browse with pagination
getAuthorById(authorId)                  // Get single author

// Title methods
searchTitles(criteria, start?, rows?)    // Search with filters
getTitlesPaginated(start, rows)          // Browse with pagination
getTitleByIsbn(isbn)                     // Get single book
getTitlesByAuthor(authorId)              // Get author's books

// Utility
getCoverImageUrl(isbn)                   // Build CDN URL for cover
convertUsdToEur(priceUsd)               // Currency conversion
```

---

## Models (Data Shapes)

### `models/author.model.ts`
```typescript
interface Author {
  authorid: string;        // Unique ID
  authordisplay: string;   // Display name
  authorfirst: string;     // First name
  authorlast: string;      // Last name
  spotlight?: string;      // Bio (HTML)
}
```

### `models/title.model.ts`
```typescript
interface Title {
  isbn: string;            // ISBN-13
  titleweb: string;        // Book title
  authorweb: string;       // Author name
  formatcode: string;      // HC, TR, EL, AU, etc.
  priceusa?: string;       // USD price
  flapcopy?: string;       // Description (HTML)
}
```

### `models/user.model.ts`
```typescript
interface User {
  username: string;
  token: string;           // JWT token
}
```

---

## Guards

### `guards/auth.guard.ts`
Protects routes - if not logged in, redirects to `/login`:

```typescript
export const authGuard: CanActivateFn = () => {
  if (authService.isLoggedIn()) return true;
  return router.navigate(['/login']);
};
```

---

## Directives

### `directives/highlight.directive.ts`
Adds hover effect to elements:

```html
<div appHighlight="#e3f2fd">Hover me!</div>
<!-- Changes background color on hover -->
```

---

## Interceptors

### `interceptors/error.interceptor.ts`
Catches all HTTP errors and:
- Shows user-friendly messages (in Slovenian)
- Redirects to login on 401
- Logs errors to console

---

## Data Flow Examples

### Login Flow
```
User enters credentials
    ↓
LoginComponent.onSubmit()
    ↓
AuthService.login() → stores token in localStorage, updates signals
    ↓
Router navigates to /search
```

### Search Authors Flow
```
User fills form, clicks "Išči avtorje"
    ↓
SearchFormComponent emits @Output() authorSearch
    ↓
SearchComponent.onAuthorSearch()
    ↓
PrhApiService.searchAuthors() → HTTP GET /api/authors
    ↓
Results stored in component, template renders AuthorCardComponent[]
```

### Browse All Titles Flow
```
ngOnInit() → preloadTitlesInBackground() loads 1000 titles
    ↓
User clicks "Vsi naslovi" tab
    ↓
loadTitlesPage(1) → checks cache, displays from cache OR fetches
    ↓
displayedTitlesPage updated → template renders TitleCardComponent[]
```

---

## Routing (`app.routes.ts`)

```typescript
Routes = [
  { path: '', redirectTo: 'search' },
  { path: 'login', loadComponent: LoginComponent },
  { path: 'search', loadComponent: SearchComponent, canActivate: [authGuard] },
  { path: 'author/:authorid', loadComponent: AuthorDetailComponent, canActivate: [authGuard] },
  { path: 'title/:isbn', loadComponent: TitleDetailComponent, canActivate: [authGuard] },
  { path: '**', loadComponent: NotFoundComponent }
]
```

All pages use **lazy loading** (`loadComponent`) for better performance.

---

## State Management

| Type | Where | How |
|------|-------|-----|
| Auth state | `AuthService` | Angular Signals (`signal<User>`) |
| API data | Components | Local properties + RxJS Observables |
| Cache | `SearchComponent` | Arrays (`titlesCache`, `authorsCache`) |
| Loading states | Components | Boolean properties (`isLoading`) |

No global store (NgRx/Akita) - keeps it simple!

---

## Key Patterns to Know

1. **Standalone Components** - No NgModules, each component declares its own imports
2. **Signals** - Modern Angular reactivity (`signal()`, `computed()`)
3. **takeUntilDestroyed()** - Auto-unsubscribe from Observables when component destroys
4. **Lazy Loading** - Routes load components on demand
5. **Functional Guards/Interceptors** - Modern Angular 14+ style

---

## Quick Reference

| Want to... | Look at... |
|-----------|-----------|
| Change API calls | `services/prh-api.service.ts` |
| Modify search form | `components/search-form/` |
| Add new route | `app.routes.ts` |
| Fix auth issues | `services/auth.service.ts`, `guards/auth.guard.ts` |
| Change pagination | `pages/search/search.ts`, `components/pagination/` |
| Update data models | `models/` |

---

## Environment Configuration

Located in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  useMockData: false,           // Set true to use mock data instead of real API
  prhApiKey: 'your-api-key'
};
```

---

## Testing with Mock Data

The `mocks/` folder contains:
- `mock-prh-api.service.ts` - Fake API service with 500ms delay
- `mock-authors.data.ts` - Sample author data
- `mock-titles.data.ts` - Sample book data

To use mock data, set `useMockData: true` in environment config.

---

## Language

The app UI is in **Slovenian**:
- Form labels: "Ime" (Name), "Priimek" (Surname), "Naslov" (Title)
- Buttons: "Išči" (Search), "Prijava" (Login), "Odjava" (Logout)
- Messages: All error/info messages in Slovenian
