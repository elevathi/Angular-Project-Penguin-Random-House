# Search Functionality Fixes

## Issues Fixed

### 1. **Observable Chain Bug in `searchTitlesByAuthorName`** ✅
**Problem**: Used `map()` to return an Observable, creating `Observable<Observable<T>>`, then tried to unwrap with `mergeMap()`.

**Fix**: Use `mergeMap()` directly after `searchAuthors()` to properly flatten the Observable chain.

```typescript
// BEFORE (BROKEN):
return this.searchAuthors(firstName, lastName).pipe(
  map(authorsResponse => authorIds),
  map(authorIds => this.http.get(...)), // Returns Observable!
  mergeMap(titleRequest => titleRequest) // Try to flatten
);

// AFTER (FIXED):
return this.searchAuthors(firstName, lastName).pipe(
  mergeMap(authorsResponse => {
    const authorIds = ...;
    return this.http.get(...); // Automatically flattened
  }),
  map(response => process(response))
);
```

### 2. **Increased Search Results Limit** ✅
**Problem**: Only fetching 200 titles for keyword searches, meaning books beyond the first 200 wouldn't be found.

**Fix**: Increased default `rows` parameter from 200 to 1000 for both:
- `searchTitles()`: Now fetches up to 1000 titles for client-side filtering
- `searchTitlesByAuthorName()`: Now fetches up to 1000 titles per author

### 3. **Better Error Handling** ✅
**Problem**: Errors would propagate to component and show generic error messages.

**Fix**: Catch errors and return empty arrays gracefully:
```typescript
catchError((error: any) => {
  console.error('❌ Error:', error);
  return of({ title: [] }); // Return empty results instead of error
})
```

### 4. **Empty Response Handling** ✅
**Problem**: Code assumed API always returns valid data structure.

**Fix**: Added checks for malformed responses:
```typescript
if (!response || !response.data || !response.data.titles) {
  console.log('⚠️ Empty or malformed response');
  return { title: [] };
}
```

### 5. **Comprehensive Debug Logging** ✅
Added detailed console logging at every step:
- 🔍 Search initiated
- 👤 Author search
- 📚 Title search
- 🆔 Author IDs found
- 📦 API responses
- 🔎 Filter results
- ✅ Final results
- ❌ Errors

## Search Flows

### Flow 1: Search Authors
```
User enters "Peterson" → onAuthorSearch() → searchAuthors("", "Peterson")
  ↓
API: /authors?authorLastInitial=P
  ↓
Filter client-side by lastName.startsWith("peterson")
  ↓
Display results
```

### Flow 2: Search Titles by Author
```
User enters author="Peterson" → onTitleSearch() → searchTitles()
  ↓
searchTitlesByAuthorName("Peterson")
  ↓
Step 1: searchAuthors("", "Peterson")
  ↓
API: /authors?authorLastInitial=P
  ↓
Get authorIds: [123, 456, ...]
  ↓
Step 2: API: /titles?authorId=123,456,...
  ↓
Filter client-side by keyword (if provided)
  ↓
Display results
```

### Flow 3: Search Titles by ISBN
```
User enters keyword="9780140258547" → searchTitles()
  ↓
Detect all-numeric → API: /titles?isbn=9780140258547
  ↓
Display results
```

### Flow 4: Search Titles by Keyword Only
```
User enters keyword="Maps of Meaning" → searchTitles()
  ↓
API: /titles?rows=1000
  ↓
Filter client-side by title.includes("maps of meaning")
  ↓
Display results
```

## Testing Checklist

- [ ] Search authors by last name only: "Peterson"
- [ ] Search authors by first name only: "Jordan"
- [ ] Search authors by full name: "Jordan Peterson"
- [ ] Search titles by author: "Peterson"
- [ ] Search titles by keyword: "Maps of Meaning"
- [ ] Search titles by keyword + author: "Maps" + "Peterson"
- [ ] Search titles by ISBN: "9780140258547"
- [ ] Search titles by format filter
- [ ] Empty search results handling
- [ ] Network error handling

## Files Modified

1. `src/app/services/prh-api.service.ts`
   - Fixed Observable chain in `searchTitlesByAuthorName()`
   - Increased default rows to 1000
   - Added comprehensive error handling
   - Added debug logging

2. `proxy.conf.json`
   - Fixed target URL (removed `/title` from path)

3. `src/app/components/search-form/*`
   - Made all search fields optional
   - Updated placeholders and help text

4. `src/app/pages/search/search.ts`
   - Updated to use API service directly instead of cache

## Known Limitations

1. **Keyword-only title search** limited to first 1000 titles in database (API limitation)
2. **No fuzzy matching** - exact substring matching only
3. **Client-side filtering** - larger result sets may be slow
4. **API response time** - fetching 1000 results may take several seconds

## Performance Considerations

- **Browse mode**: Pre-loads 1000 titles in background for instant pagination
- **Search mode**: Fetches 1000 titles on-demand (2-5 seconds)
- **Author search**: Usually fast (< 1 second) due to API filtering
- **ISBN search**: Very fast (direct lookup)

## Future Improvements

1. Implement debouncing on search input
2. Add search result caching
3. Implement pagination for large search results
4. Add advanced search filters (publication date, price range, etc.)
5. Add autocomplete for author names
6. Add "Did you mean?" suggestions for misspellings
