---
title: Authentication
---

# Authentication

The Insights API authenticates every request using a Personal Access Token (PAT) issued
from LFX Self-Serve. There is no separate API key format, no client secret, and no
OAuth2 dance you need to implement yourself.

## Creating a PAT

1. Sign in to LFX Self-Serve.
2. Open Developer Settings and create a new token scoped to the **Insights** audience.
3. Give it a name that tells you where it is used (for example, `ci-nightly-export`).
4. Copy the token when it is shown. It is not shown again; if you lose it, revoke it and
   create a new one.

Insights-audience PATs always carry the `lfi_` prefix, so they are easy to distinguish
from tokens issued for other LFX products.

## Sending the token

Send the PAT as a bearer token on the `Authorization` header of every request:

```
Authorization: Bearer lfi_your_token_here
```

You do not exchange the PAT for anything yourself. Behind the scenes, our edge layer
validates the `lfi_` prefix and exchanges the token for a short-lived, signed credential
using Auth0 Custom Token Exchange, then resolves your organization and membership tier and
forwards the request to the API. That exchange result is cached for a few minutes, so
most requests do not pay the exchange cost. None of this changes what you send: it is
always the same PAT, on every request, forever (until you rotate or revoke it).

## Rotating and revoking

PATs do not auto-expire, and you can hold multiple active PATs per user at once. That
makes zero-downtime rotation straightforward:

1. Mint a new PAT in Developer Settings.
2. Switch your integration over to it.
3. Revoke the old PAT once you have confirmed the new one works.

Revoking a PAT takes effect on the next token exchange, so the effective revocation
window is bounded by the exchange cache (on the order of a few minutes), not immediate.
Plan for that short window if a token may have been compromised.

## What determines your rate limit

Your organization's LFX membership tier is resolved as part of the token exchange above
and used as the key for rate limiting, see the quickstart's [rate limit
section](/#watch-your-rate-limit) for how limits are enforced and reported.

## Common mistakes

- **Wrong prefix.** If your token does not start with `lfi_`, it was not issued for the
  Insights audience and will be rejected.
- **Pasting the PAT into a browser tool.** The API's interactive documentation does not
  offer a "try it" client that executes requests from the browser, specifically so
  customers are not tempted to paste long-lived credentials into a page. Use `curl`,
  a script, or your own backend service instead.
- **Committing the token to source control.** Treat an `lfi_` PAT like any other
  long-lived secret: environment variable, secret manager, or CI secret store, never a
  committed file.
