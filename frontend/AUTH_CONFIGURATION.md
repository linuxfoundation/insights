# Auth0 Configuration

## Environment Variables

The Auth0 implementation supports the following environment variables:

### Required Variables

- `AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-domain.auth0.com`)
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `AUTH0_AUDIENCE` - Your Auth0 API audience
- `APP_URL` - Your application URL (e.g., `http://localhost:3000`)
- `AUTH0_REDIRECT_URI` - Full redirect URI for Auth0
  - **Default:** `{APP_URL}/auth/callback`
  - **Note:** This should match what's configured in your Auth0 application

## Callback Path Configuration

### Using `auth/callback` (Page Route)

- Creates a page at `http://localhost:3000/auth/callback`
- Shows a loading screen while processing
- Redirects to API endpoint for token exchange
- Good for single-page applications

### Using `/api/auth/callback` (API Route)

- Currently only works on local
- In the staging and prod this throws an error page not found

* Direct API endpoint handling
* No intermediate loading page
* More secure (no client-side processing)
* Default and recommended approach

## Auth0 Application Configuration

In your Auth0 application settings, set the **Allowed Callback URLs** to match your configuration:

- For page route: `http://localhost:3000/auth/callback`
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

## How the Login Flow Works

The authentication flow in this application uses Auth0 and follows the OAuth 2.0 Authorization Code with PKCE pattern. Here are the steps involved in the login process:

### 1. User Initiates Login

- The user clicks a "Login" button in the app.
- The frontend calls the `/api/auth/login` endpoint.

### 2. Redirect to Auth0

- The `/api/auth/login` endpoint:
  - Generates a random `state` and `code_verifier` for PKCE.
  - Stores these values in secure, HTTP-only cookies.
  - Builds the Auth0 authorization URL with the required parameters (including PKCE challenge).
  - Returns the Auth0 authorization URL to the frontend.
- The frontend redirects the user to the Auth0 login page.

### 3. User Authenticates with Auth0

- The user enters their credentials on the Auth0 login page.
- Upon successful authentication, Auth0 redirects the user back to the configured `AUTH0_REDIRECT_URI` (e.g., `/auth/callback`).

### 4. Callback Handling

- If using the page route (`/auth/callback`) - CURRENT SETUP:
  - The user lands on a loading page (`/auth/callback`).
  - The page immediately redirects the user (with all query parameters) to the API endpoint `/api/auth/callback`.
- If using the API route directly (`/api/auth/callback`):
  - Auth0 redirects directly to the API endpoint.

### 5. Token Exchange

- The `/api/auth/callback` endpoint:
  - Validates the `state` parameter to prevent CSRF attacks.
  - Retrieves the `code_verifier` from the cookie.
  - Exchanges the authorization code for tokens (access token, ID token, and optionally refresh token) with Auth0.
  - Stores the tokens in secure, HTTP-only cookies.
  - Cleans up temporary cookies (`state`, `code_verifier`, etc.).
  - Redirects the user to their original destination or the home page.

### 6. Authenticated Session

- The user is now authenticated.
- The app can use the tokens stored in cookies to make authenticated API requests.

### 7. Logout

- When the user logs out:
  - The frontend calls `/api/auth/logout`.
  - This endpoint clears all authentication cookies and, if possible, redirects the user to the Auth0 logout endpoint to complete the logout process.

---

**Summary Diagram:**

<img width="3802" height="3840" alt="insights auth mermaid chart" src="https://github.com/user-attachments/assets/16369652-e504-4688-af43-1db086255c2e" />
