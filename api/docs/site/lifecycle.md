---
title: Endpoint lifecycle
---

# Endpoint lifecycle

New Insights API endpoints launch under `/v1-alpha` before they graduate to `/v1`. This
page explains what each stage means for you as a caller.

## `/v1-alpha`

- Access is **allow-listed**: only LFX-internal developers and external design partners
  we've explicitly enrolled can call `/v1-alpha` endpoints.
- There are **no contract guarantees**. Response shapes, field names, and error codes can
  change at any time.
- We allow **breaking changes** freely at this stage, since it exists to validate an
  endpoint's contract and performance before wider exposure.

Do not build production integrations against `/v1-alpha`.

## `/v1`

An endpoint moves from `/v1-alpha` to `/v1` once it passes promotion criteria:

- A **load test** at expected production traffic
- One week of a stable response shape with the alpha cohort
- Healthy error and latency budgets
- **Security sign-off**

Once promoted, `/v1` is open to any caller with a valid PAT, and the contract locks in:
within `/v1` we only make additive changes (new fields, new optional params, new
endpoints, new error codes), callers should ignore fields they don't recognize, and any
removal, rename, type change, or constraint-tightening (making an optional param
required, lowering a max `pageSize`, dropping a value from a `sort` allow-list) requires
a new `/v2` route rather than changing `/v1` in place. See [Errors](/errors) for the
error envelope and JSON conventions that apply across every version.

## Sunset of the `/v1-alpha` route

On promotion, `/v1-alpha` immediately returns `410` (`Gone`), with a
`Link: </v1/...>; rel="successor-version"` header pointing at the replacement route, so
callers can migrate programmatically instead of guessing the new URL. That `410`
response stays in place for at least **two weeks**, then the `/v1-alpha` route is
removed entirely.

See the [Changelog](/changelog) for when individual endpoints are promoted.
