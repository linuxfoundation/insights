---
title: Pagination
---

# Pagination

List endpoints in the Insights API use cursor-based pagination: you follow a cursor
forward through the result set until it runs out.

## Request parameters

Paginated endpoints accept two query parameters, both optional:

| Parameter  | Type                    | Default | Notes                      |
| ---------- | ----------------------- | ------- | -------------------------- |
| `cursor`   | opaque base64url string | (none)  | Omit on the first request. |
| `pageSize` | integer                 | `50`    | Maximum `200`.             |

## Response shape

```json
{
  "data": [/* ...page of results... */],
  "pageSize": 50,
  "nextCursor": "eyJrIjoiMjAyNS0xMi0zMSIsImlkIjoiNDIifQ"
}
```

- `data` is the page of results.
- `pageSize` echoes back the effective page size used for this request.
- `nextCursor` is the value to pass as `cursor` on your next request. When it is `null`,
  you have reached the end of the list.

To iterate an entire collection, keep requesting with the previous response's
`nextCursor` until you receive `nextCursor: null`.

```bash
curl "https://api.insights.linuxfoundation.org/v1/projects?pageSize=100" \
  -H "Authorization: Bearer lfi_your_token_here"

curl "https://api.insights.linuxfoundation.org/v1/projects?pageSize=100&cursor=eyJrIjoiMjAyNS0xMi0zMSIsImlkIjoiNDIifQ" \
  -H "Authorization: Bearer lfi_your_token_here"
```

## What cursors guarantee

- **No skipped or duplicated rows.** Each page picks up exactly where the previous one
  ended, even when data is added or removed between your requests.
- **Consistent performance.** The first page and the hundredth page respond equally fast,
  so iterating a large collection does not slow down as you go deeper.

Endpoints that page through a ranking, such as a leaderboard, page by position instead, so
a row whose rank changes between your requests, or that ties with others at a page
boundary, can be skipped or repeated. Their descriptions say so. The performance guarantee
does not cover them either: each request recomputes the whole ranking before it takes a
page, so a deep page costs about as much as the first.

## Cursors are opaque

Treat `nextCursor` as an opaque string. Do not parse it, construct one by hand, or persist
it as structured data; pass it back to the API exactly as received. The encoding may
change between releases without notice, and that is not a breaking change.

Cursors are also tied to the `sort` value used to generate them. If an endpoint supports a
`sort` parameter, do not reuse a cursor obtained under one `sort` value after switching to
another; request a fresh first page instead.

## No `total` field

Paginated responses never include a total count. If you need a total for a specific use
case, check whether the endpoint offers a dedicated count endpoint before resorting to
counting pages yourself.

## Caching

Paginated responses follow the same [caching contract](/#make-your-first-request) as
every other Insights API response: always re-fetch rather than relying on a locally cached
page while iterating.
