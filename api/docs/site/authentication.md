---
title: Authentication
---

# Authentication

The Insights API authenticates every request using a Personal Access Token (PAT) issued
from LFX Self-Serve. The PAT is the only credential you need.

## Creating a PAT

1. Sign in to LFX Self-Serve.
2. Open Developer Settings and create a new token scoped to the **Insights** audience.
3. Give it a name that tells you where it is used (for example, `ci-nightly-export`).
4. Choose an expiration: 30, 60, or 90 days, 1 year, or no expiration.
5. Copy the token when it is shown. It is not shown again; if you lose it, revoke it and
   create a new one.

Insights-audience PATs always carry the `lfi_` prefix, so they are easy to distinguish
from tokens issued for other LFX products.

## Sending the token

Send the PAT as a bearer token on the `Authorization` header of every request:

```
Authorization: Bearer lfi_your_token_here
```

You send the same PAT on every request; it keeps working until it expires or you rotate
or revoke it.

## Rotating and revoking

PATs expire on the schedule you chose at creation (unless you picked no expiration), and
you can hold multiple active PATs per user at once. That makes zero-downtime rotation
straightforward:

1. Mint a new PAT in Developer Settings.
2. Switch your integration over to it.
3. Revoke the old PAT once you have confirmed the new one works.

Revocation is not instant: it can take a few minutes to propagate. Plan for that short
window if a token may have been compromised.

## What determines your rate limit

Your organization's LFX membership tier determines your rate limit. See the quickstart's
[rate limit section](/#watch-your-rate-limit) for how limits are enforced and reported.

## Common mistakes

- **Wrong prefix.** If your token does not start with `lfi_`, it was not issued for the
  Insights audience and will be rejected.
- **Pasting the PAT into a browser tool.** The API's interactive documentation does not
  offer a "try it" client that executes requests from the browser. Use `curl`, a script,
  or your own backend service instead, and treat the PAT as a secret that never belongs
  in a browser.
- **Committing the token to source control.** Treat an `lfi_` PAT like any other
  long-lived secret: environment variable, secret manager, or CI secret store, never a
  committed file.
