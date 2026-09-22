---
title: Authentication
---

# Authentication

The Insights API authenticates every request using a Personal Access Token (PAT) issued
from [LFX Self-Serve](https://app.lfx.dev/). The PAT is the only credential you need.

## Who can create a PAT

Creating a PAT requires being a Key Contact for an organization with active LFX
membership. If you are not a Key Contact, ask one on your team to create tokens for your
integrations, or to grant you Key Contact status.

## Creating a PAT

Create a PAT in [LFX Self-Serve Developer Settings](https://app.lfx.dev/settings), scoped
to the **Insights** audience. You'll name the token and choose an expiration (30, 60, or
90 days, 1 year, or no expiration). The token is shown once; copy it immediately. If you
lose it, revoke it and create a new one.

Insights-audience PATs always carry the `lfi_` prefix, so they are easy to distinguish
from tokens issued for other LFX products.

## Sending the token

Send the PAT as a bearer token on the `Authorization` header of every request:

```
Authorization: Bearer lfi_your_token_here
```

You send the same PAT on every request; it keeps working until it's expired, rotated, or
revoked. It can also stop working if your organization's LFX membership ends or your Key
Contact status changes.

## Rotating and revoking

PATs expire on the schedule you chose at creation (unless you picked no expiration), and
you can hold multiple active PATs per user at once. To rotate without downtime, mint a
new PAT in [Developer Settings](https://app.lfx.dev/settings), switch your integration
over to it, then revoke the old one once you have confirmed the new one works.

Revocation is not instant: it can take up to about 10 minutes to take effect. Plan for
that window if a token may have been compromised.

## What determines your rate limit

Your organization's LFX membership tier determines your rate limit, and that limit is
shared across everyone in your organization using the API. See the quickstart's
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
