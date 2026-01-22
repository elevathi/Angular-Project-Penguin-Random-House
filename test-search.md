# How to Test the Search Fixes

## Prerequisites
- Angular dev server running on `http://localhost:4200`
- Browser DevTools open (F12) with Console tab visible

## Test Sequence

### ✅ Test 1: Search Authors by Last Name
1. Go to: `http://localhost:4200/search?type=authors`
2. Enter last name: `Peterson`
3. Click "Išči avtorje"
4. **Expected console output**:
   ```
   👤 searchAuthors called - firstName: lastName: Peterson
   🔤 Using authorLastInitial: P
   🌐 API Request: /api/domains/PRH.US/authors Params: start=0&rows=200&api_key=...&authorLastInitial=P&sort=authorLast
   📦 Authors API Response: X authors received
   🔎 Last name filter: X → Y authors
   ✅ Final author result: Y authors
   Found Y authors matching criteria
   ```
5. **Expected result**: List of authors with last name starting with "Peterson"

### ✅ Test 2: Search Titles by Author Name
1. Go to: `http://localhost:4200/search?type=titles`
2. Enter author: `Peterson`
3. Click "Išči naslove"
4. **Expected console output**:
   ```
   🔍 searchTitles called with criteria: {author: "Peterson", ...}
   📚 Using two-step author search for: Peterson
   👤 Step 1: Searching for author - firstName:  lastName: Peterson
   👤 searchAuthors called - firstName:  lastName: Peterson
   🔤 Using authorLastInitial: P
   📦 Authors API Response: X authors received
   👥 Step 1 Result: Found X authors
   🆔 Author IDs: [123, 456, ...]
   📚 Step 2: Fetching titles for authors - URL: ...
   📦 Step 2 Result: Received Y titles from API
   ✅ Final result: Y titles
   Found Y titles matching criteria
   ```
5. **Expected result**: List of books by authors with last name "Peterson"

### ✅ Test 3: Search Titles by ISBN
1. Go to: `http://localhost:4200/search?type=titles`
2. Enter title/ISBN: `9780735211292` (Atomic Habits)
3. Click "Išči naslove"
4. **Expected console output**:
   ```
   🔍 searchTitles called with criteria: {keyword: "9780735211292", ...}
   🔢 Searching by ISBN: 9780735211292
   🌐 API Request: /api/domains/PRH.US/titles Params: ...&isbn=9780735211292
   📦 API Response: 1 titles received
   ✅ Final result: 1 titles
   ```
5. **Expected result**: Single book (Atomic Habits)

### ✅ Test 4: Search Titles by Keyword
1. Go to: `http://localhost:4200/search?type=titles`
2. Enter title: `Rules`
3. Click "Išči naslove"
4. **Expected console output**:
   ```
   🔍 searchTitles called with criteria: {keyword: "Rules", ...}
   🌐 API Request: /api/domains/PRH.US/titles Params: start=0&rows=1000&api_key=...
   📦 API Response: 1000 titles received
   🔎 Keyword filter: 1000 → X titles
   📚 Non-book filter: X → Y titles
   ✅ Final result: Y titles
   ```
5. **Expected result**: Books with "Rules" in the title

### ✅ Test 5: Search Titles by Keyword + Author
1. Go to: `http://localhost:4200/search?type=titles`
2. Enter title: `12 Rules`
3. Enter author: `Peterson`
4. Click "Išči naslove"
5. **Expected result**: "12 Rules for Life" by Jordan Peterson

## Common Issues & Solutions

### ❌ No console output
**Problem**: Console logs not showing
**Solution**: Make sure DevTools Console is open and filter is set to "All levels"

### ❌ "Napaka pri iskanju" error message
**Problem**: API request failed
**Solution**:
1. Check network tab for failed requests
2. Verify API key is valid in `src/environments/environment.ts`
3. Check proxy configuration in `proxy.conf.json`

### ❌ Empty results when you expect data
**Problem**: Filters are too restrictive
**Solution**:
1. Try searching with fewer criteria
2. Check console logs to see where results are being filtered out
3. Try ISBN search to verify API is working

### ❌ TypeScript errors in console
**Problem**: Code compilation issues
**Solution**:
1. Stop dev server (Ctrl+C)
2. Run `npm install`
3. Restart dev server `npm start`

## Success Criteria

✅ All 5 tests pass
✅ Console shows detailed debug logs at each step
✅ Search results display correctly
✅ No errors in console (except expected "no results" messages)
✅ Loading spinner shows/hides correctly

## Debugging Tips

1. **Check API responses**: Look for `📦` emoji in console to see actual API data
2. **Check filters**: Look for `🔎` and `📚` emojis to see what's being filtered
3. **Check errors**: Look for `❌` emoji for error messages
4. **Network tab**: Check actual HTTP requests and responses
5. **React to changes**: Angular auto-reloads - wait for "Compiled successfully" message

## Performance Notes

- **Author search**: ~1-2 seconds
- **Title search by author**: ~2-4 seconds (two API calls)
- **Title search by keyword**: ~3-5 seconds (fetches 1000 titles)
- **ISBN search**: ~1 second (direct lookup)

If searches are taking longer, check your network connection or API server status.
