# Auth0 Configuration

## Environment Variables

The Auth0 implementation supports the following environment variables:

### Required Variables

- `AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-domain.auth0.com`)
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `AUTH0_AUDIENCE` - Your Auth0 API audience
- `APP_URL` - Your application URL (e.g., `http://localhost:3000`)

### Optional Variables

- `AUTH0_CALLBACK_PATH` - The callback path for Auth0 redirects
  - **Options:**
    - `/callback` - Uses a Nuxt page route (simpler, good for SPAs)
    - `/api/auth/callback` - Uses API route only (default, more secure)
  - **Default:** `/api/auth/callback`

- `AUTH0_REDIRECT_URI` - Full redirect URI for Auth0
  - **Default:** `{APP_URL}/callback`
  - **Note:** This should match what's configured in your Auth0 application

## Callback Path Configuration

### Using `/callback` (Page Route)

```bash
AUTH0_CALLBACK_PATH=/callback
```

- Creates a page at `http://localhost:3000/callback`
- Shows a loading screen while processing
- Redirects to API endpoint for token exchange
- Good for single-page applications

### Using `/api/auth/callback` (API Route)

```bash
AUTH0_CALLBACK_PATH=/api/auth/callback
```

- Direct API endpoint handling
- No intermediate loading page
- More secure (no client-side processing)
- Default and recommended approach

## Auth0 Application Configuration

In your Auth0 application settings, set the **Allowed Callback URLs** to match your configuration:

- For page route: `http://localhost:3000/callback`
- For API route: `http://localhost:3000/api/auth/callback`

## Example .env Configuration

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=your-api-audience
AUTH0_REDIRECT_URI=http://localhost:3000/auth/callback

# Application Configuration
APP_URL=http://localhost:3000
```
