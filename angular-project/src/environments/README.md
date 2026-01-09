# Environment Configuration

## Setup Instructions

1. Copy `environment.template.ts` to `environment.ts` (for development)
2. Copy `environment.template.ts` to `environment.prod.ts` (for production)
3. Get your Penguin Random House API key from: https://developer.penguinrandomhouse.com/
4. Replace `YOUR_API_KEY_HERE` with your actual API key in both files

## Files

- `environment.template.ts` - Template file (committed to git)
- `environment.ts` - Development config (ignored by git)
- `environment.prod.ts` - Production config (ignored by git)

## Example

```typescript
export const environment = {
  production: false,
  prhApiKey: 'abc123xyz789'  // Your actual API key
};
```

## Security Note

⚠️ **NEVER commit your actual API keys to git!**

The `.gitignore` file is configured to ignore `environment.ts` and `environment.prod.ts` to prevent accidentally committing API keys.
