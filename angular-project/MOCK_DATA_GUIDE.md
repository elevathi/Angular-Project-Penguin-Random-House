# Mock Data Implementation Guide

## ✅ Complete! Your application is ready to use with mock data

While you're waiting for your Penguin Random House API key, the application is fully functional with realistic mock data.

## 🎯 Quick Start

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Login with test credentials:**
   - Username: `testuser`
   - Password: `testpassword`

3. **Try searching:**
   - Search for authors: "King", "Rowling", "Gaiman"
   - Search for titles: "Harry Potter", "Game", "Shining"

## 📊 Mock Data Available

### 5 Authors
- **Stephen King** (Horror) - 3 books
- **J.K. Rowling** (Fantasy) - 3 books
- **George R.R. Martin** (Epic Fantasy) - 2 books
- **Agatha Christie** (Mystery) - 2 books
- **Neil Gaiman** (Contemporary Fantasy) - 2 books

### 12 Books
All books include:
- Title, ISBN, Author
- Price, Format (Hardcover/Paperback)
- Subject categories
- Book descriptions
- Placeholder cover images

## 🔧 How It Works

The mock system is configured in **app.config.ts**:

```typescript
// Conditionally provide mock or real API service
environment.useMockData
  ? { provide: PrhApiService, useClass: MockPrhApiService }
  : PrhApiService
```

When `useMockData: true` in environment.ts:
- All API calls go to MockPrhApiService
- Returns mock data with 500ms simulated network delay
- No real API key needed

## 🔄 Switching to Real API

When you get your API key:

1. **Update environment.ts:**
   ```typescript
   export const environment = {
     production: false,
     useMockData: false,  // ← Change to false
     prhApiKey: 'your-real-api-key'
   };
   ```

2. **Restart the application:**
   ```bash
   npm start
   ```

That's it! The app will automatically use the real API.

## 📁 Mock Data Files

```
src/app/mocks/
├── mock-authors.data.ts      # 5 mock authors
├── mock-titles.data.ts       # 12 mock books
├── mock-prh-api.service.ts   # Mock API service
└── README.md                 # Detailed documentation
```

## 🧪 Testing Features

All features work with mock data:

### ✅ Author Search
- Search by first name
- Search by last name
- Search by both
- View author details
- View author's books

### ✅ Title Search
- Search by title
- Search by keyword
- View book details
- Filter by category

### ✅ Navigation
- Click on authors to see their books
- Click on books to see details
- Navigate between pages

### ✅ UI Features
- Loading spinners
- Error handling
- Empty states
- Responsive design

## 🎨 Placeholder Images

Book covers use placeholder images from:
```
https://via.placeholder.com/300x450/3b82f6/ffffff?text=Book+Title
```

When you switch to the real API, actual book cover images will load automatically.

## 📝 Notes

- Mock data has 500ms simulated network delay for realistic UX
- All searches are case-insensitive
- Data structure matches real API responses
- No external API calls are made in mock mode
- Perfect for offline development

## 🚀 Next Steps

1. **Get API Key:** Visit https://developer.penguinrandomhouse.com/
2. **Update environment.ts:** Add your API key and set `useMockData: false`
3. **Test with real data:** The app will work identically with real API

## 🔒 Security

Mock data is completely safe:
- No sensitive information
- No real API calls
- No authentication required (for mock data)
- Switch to real API anytime

---

**Happy Development!** 🎉

The application is fully functional and ready to demonstrate all features while you wait for your API key.
