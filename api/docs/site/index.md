---
title: Quickstart
---

# LFX Insights API

The LFX Insights API gives customers programmatic access to the health, activity, and
security metrics that power [LFX Insights](https://insights.linuxfoundation.org). It is a
standalone service, versioned and rate limited independently from the Insights web app.

This page walks through the three things every integration needs: getting a credential,
making a first request, and handling the responses the API sends back.

## 1. Get a Personal Access Token

Every request must carry a credential. Credentials are Personal Access Tokens (PATs) that
you create yourself in LFX Self-Serve Developer Settings, scoped to the Insights audience.
Insights-audience PATs are always prefixed `lfi_`, so you can tell them apart from tokens
issued for other LFX products at a glance.

The PAT is shown once at creation time. Store it the way you would any other long-lived
secret (a secrets manager, CI secret store, or local `.env` file that is not committed).
There is no client-side token-swap step: you send the PAT itself on every call.

## 2. Make your first request {#make-your-first-request}

Send the PAT as a bearer token on the `Authorization` header of any request:

```bash
curl https://api.insights.linuxfoundation.org/v1/projects/torvalds-linux \
  -H "Authorization: Bearer lfi_your_token_here"
```

A successful response is plain JSON with camelCase field names (see
[Errors](/errors) for more on our JSON conventions). A failed request returns a
non-2xx status code and a JSON error body, described below.

Every response, success or failure, also carries `Cache-Control: private, max-age=0`.
That tells your HTTP client, and any proxy in between, not to cache the response, so
every request you make returns current data. See [Pagination](/pagination) for how this
interacts with list endpoints.

## 3. Understand the error envelope

Every error response uses one consistent shape, regardless of which endpoint produced it:

```json
{
  "error": {
    "code": "invalid_sort",
    "message": "Unsupported sort value 'foo' for this endpoint.",
    "requestId": "4e1f9c2a2b7e4d3b9a7a4a1e9e2b6f10",
    "docsUrl": "https://api.insights.linuxfoundation.org/docs/errors#invalid_sort"
  }
}
```

See [Errors](/errors) for what each field means, our JSON/date conventions, and the full
list of error codes you may encounter.

## 4. Watch your rate limit {#watch-your-rate-limit}

Every PAT is tied to your organization's LFX membership tier, and that tier determines
your rate limit pool. Once you hit your limit, the API responds with
`429 Too Many Requests` and a `Retry-After` header
telling you how long to wait before trying again. Rate-limit accounting is returned on
every response via `X-RateLimit-*` headers so you can back off before you ever see a 429.

If you are building a batch job or pipeline, prefer iterating with the cursor-based
pagination described in [Pagination](/pagination) rather than polling in a tight loop, and
add your own client-side backoff on `429` responses.

## Where to go next

- [Authentication](/authentication): full detail on the `lfi_` PAT scheme.
- [Pagination](/pagination): cursor-based pagination for list endpoints.
- [Errors](/errors): the full error code reference, plus our JSON and date conventions.
- [Changelog](/changelog): what changed, release by release.
