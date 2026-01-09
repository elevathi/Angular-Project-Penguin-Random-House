# Penguin Random House API Setup

## Quick Start

### 1. Get Your API Key
Visit [Penguin Random House Developer Portal](https://developer.penguinrandomhouse.com/) to register and obtain your API key.

### 2. Configure Environment Files

```bash
# Navigate to environments folder
cd src/environments

# Create environment files from template
cp environment.template.ts environment.ts
cp environment.template.ts environment.prod.ts
```

### 3. Add Your API Key

Edit both `environment.ts` and `environment.prod.ts`:

```typescript
export const environment = {
  production: false, // or true for environment.prod.ts
  prhApiKey: 'your-actual-api-key-here'
};
```

### 4. Run the Application

```bash
npm start
```

## API Key Usage

The API key is automatically added to all Penguin Random House API requests as a query parameter (`api_key`).

### Endpoints using the API key:
- Search Authors: `/resources/authors?api_key=...`
- Get Author by ID: `/resources/authors/{id}?api_key=...`
- Search Titles: `/resources/titles?api_key=...`
- Get Title by ISBN: `/resources/titles/{isbn}?api_key=...`
- Get Titles by Author: `/resources/titles?authorid={id}&api_key=...`

## Security

⚠️ **Important**: The environment files with actual API keys are ignored by git (`.gitignore`). Only the template file is committed to the repository.

**Never commit:**
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

**Safe to commit:**
- `src/environments/environment.template.ts`
- `src/environments/README.md`

## Production Build

For production builds with the production API key:

```bash
npm run build
```

Angular will automatically use `environment.prod.ts` for production builds.
