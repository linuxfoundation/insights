---
title: Errors
---

# Errors

All Insights API errors, from every endpoint, share one JSON shape. This page documents
that shape, our general JSON and date conventions, and the error codes you should
expect to handle.

## Error body

```json
{
  "statusCode": 404,
  "code": "not_found",
  "error": "Not Found",
  "message": "Project not found"
}
```

| Field        | Description                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `statusCode` | The HTTP status code, repeated in the body.                                                       |
| `code`       | Stable, machine-readable identifier. Safe to branch on in code.                                   |
| `error`      | The standard HTTP reason phrase for `statusCode`, such as `Not Found`.                            |
| `message`    | Human-readable explanation. Useful for logs, not guaranteed word-for-word stable across releases. |

A request to a path that matches no route returns `404` without a `code` field. Branch on
the HTTP status when `code` is missing.

Adding a new error `code` is not a breaking change: new codes can appear at any time as
the API grows, and clients should treat an unrecognized `code` the same way they treat any
other error they don't specifically handle.

## JSON conventions

All request and response field names are **camelCase** (`startDate`, `activityTypes`,
`includeCodeContributions`), including inside error responses and paginated envelopes.
No field name uses snake_case.

Date and timestamp values are always **ISO-8601** strings in UTC: dates as `2025-12-31`,
timestamps as `2025-12-31T23:59:59Z`. The API never returns Unix timestamps or
locale-formatted dates.

## Common error codes

| HTTP status | `code`                 | Meaning                                                                                                                                                           |
| ----------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`       | `FST_ERR_VALIDATION`   | A path or query parameter fails the endpoint's schema: missing, wrong type, out of range, or a `sort` value not on the allow-list. `message` names the parameter. |
| `400`       | `invalid_request`      | A parameter passes the schema but is still unusable, such as a `cursor` the API did not issue or an invalid date range.                                           |
| `401`       | `unauthorized`         | The `Authorization` header is missing, malformed, or the token is invalid or expired.                                                                             |
| `403`       | `tier_forbidden`       | Your tier does not include this endpoint. The organization endpoints require the premium tier.                                                                    |
| `404`       | `not_found`            | The requested resource does not exist.                                                                                                                            |
| `429`       | `rate_limit_exceeded`  | You have exceeded your rate limit. See `Retry-After`.                                                                                                             |
| `503`       | `upstream_unavailable` | An upstream data source is unavailable. Retry later with backoff.                                                                                                 |

This list grows over time as new endpoints ship. Treat any `code` you don't recognize as
a generic error for its HTTP status.

## Rate limit responses

When you exceed your rate limit, the API returns `429` with `code: rate_limit_exceeded`, plus a
`Retry-After` header telling you how many seconds to wait. Responses to authenticated
requests, successful or not, also carry `X-RateLimit-*` headers so you can track your
remaining budget and back off before hitting the limit. A response can occasionally arrive
without them, so treat them as optional. See the quickstart's [rate limit
section](/#watch-your-rate-limit) for more detail.

| Header                  | Meaning                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `X-RateLimit-Limit`     | Requests you can make per second.                               |
| `X-RateLimit-Remaining` | Requests left in the current one-second window.                 |
| `X-RateLimit-Reset`     | Seconds until the window has room for another request.          |
| `Retry-After`           | On `429` only: seconds to wait before sending the next request. |

## Caching headers on error responses

Error responses are not cached any differently from successful ones. See the quickstart's
[caching note](/#make-your-first-request) for the response-wide caching contract, which
applies here too.
