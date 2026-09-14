---
title: Errors
---

# Errors

All Insights API errors, from every endpoint, share one JSON shape. This page documents
that envelope, our general JSON and date conventions, and the error codes you should
expect to handle.

## Error envelope

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

| Field       | Description                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `code`      | Stable, machine-readable identifier. Safe to branch on in code.                                 |
| `message`   | Human-readable explanation. Useful for logs, not guaranteed word-for-word stable across releases. |
| `requestId` | Identifies this request in our tracing system. Include it when contacting support.               |
| `docsUrl`   | Deep link back to the relevant section of this page.                                            |

Adding a new error `code` is not a breaking change: new codes can appear at any time as
the API grows, and clients should treat an unrecognized `code` the same way they treat any
other error they don't specifically handle.

## JSON conventions

All request and response field names are **camelCase** (`startDate`, `activityTypes`,
`includeCodeContributions`), including inside error responses and paginated envelopes.
There is no snake_case anywhere in the public contract, even where the data originates
from an internal store that uses different naming.

Date and timestamp values are always **ISO-8601** strings in UTC, for example
`2025-12-31T23:59:59Z`. The API never returns Unix timestamps or locale-formatted dates.

## Common error codes

| HTTP status | `code`               | Meaning                                                                 |
| ----------- | -------------------- | ------------------------------------------------------------------------ |
| `400`       | `invalid_sort`       | The `sort` value is not on the endpoint's allow-list.                    |
| `400`       | `invalid_request`    | A required parameter is missing or malformed.                           |
| `401`       | `unauthorized`       | The `Authorization` header is missing, malformed, or the token is invalid or expired. |
| `403`       | `tier_forbidden`     | Your membership tier does not have access to this endpoint (reserved for future per-endpoint tier gating; every v1 endpoint is open to all tiers). |
| `404`       | `not_found`          | The requested resource does not exist.                                  |
| `429`       | `rate_limit_exceeded` | You have exceeded your organization's rate limit. See `Retry-After`.     |
| `503`       | `upstream_unavailable` | An upstream data source is unavailable and no cached response could be served. |

This list grows over time as new endpoints ship; check `docsUrl` on any error you don't
recognize, since it points at the current, authoritative reference for that code.

## Rate limit responses

When you exceed your rate limit, the API returns `429` with `code: rate_limit_exceeded`, plus a
`Retry-After` header telling you how many seconds to wait. Every response, whether
successful or not, also includes `X-RateLimit-*` headers so you can track your remaining
budget and back off before hitting the limit. See the quickstart's [rate limit
section](/#watch-your-rate-limit) for more detail.

## Caching headers on error responses

Error responses are not cached any differently from successful ones — see the quickstart's
[caching note](/#make-your-first-request) for the response-wide caching contract, which
applies here too.
