# API keys are stored and managed in Auth0

API keys are issued and persisted as Auth0 credentials, managed via the Auth0 Management API. The LFX Insights frontend calls the Management API to create, list, and revoke keys on behalf of the user. JWT signing and JWKS verification are handled by Auth0, consistent with the existing auth infrastructure.

Storing keys in our own Postgres (`/api`) was rejected because it would require us to own the signing key, the revocation surface, and the token lifecycle — duplicating what Auth0 already provides securely. Auth0 is the single source of truth for all auth state in this system; keeping keys there avoids a second identity store.

The cost is a dependency on Auth0 Management API rate limits for the key management UI (create/revoke operations) — acceptable because key management is a low-frequency human action, not a hot path.
