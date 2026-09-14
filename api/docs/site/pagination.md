---
title: Pagination
---

# Pagination

List endpoints in the Insights API use cursor-based pagination. There is no page number
and no `total` field: you follow a cursor forward through the result set until it runs out.

## Request parameters

Paginated endpoints accept two query parameters, both optional:

| Parameter  | Type                    | Default | Notes                                   |
| ---------- | ----------------------- | ------- | ---------------------------------------- |
| `cursor`   | opaque base64url string | (none)  | Omit on the first request.               |
| `pageSize` | integer                 | `50`    | Maximum `200`.                           |

## Response shape

```json
{
  "data": [ /* ...page of results... */ ],
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

## Why cursors instead of page numbers

Cursor-based pagination anchors each page to the sort key of the last row you saw,
rather than to a numeric offset. That matters for two reasons:

- **Stability under mutations.** With offset pagination (`page`/`pageSize`), an insertion
  or deletion between two page fetches shifts every row after it, which can cause rows to
  be skipped or duplicated across pages. A cursor is immune to this, because it does not
  depend on position, only on the value of the last row returned. This is a real concern
  here: Insights data (commits, contributors, vulnerabilities) grows continuously.
- **Cost at scale.** Offset pagination gets more expensive the deeper you page, because
  the database still has to scan and discard every skipped row. A cursor query is a
  simple indexed range lookup, so the first page and the hundredth page cost the same.

This mirrors how Stripe, GitHub, AWS, Linear, and Slack paginate their public APIs.

## Cursors are opaque

Treat `nextCursor` as an opaque string. Do not parse it, construct one by hand, or persist
it as structured data; pass it back to the API exactly as received. The internal encoding
may change between releases without that being a breaking change, precisely because the
cursor's contents are not part of the public contract.

Cursors are also tied to the `sort` value used to generate them. If an endpoint supports a
`sort` parameter, do not reuse a cursor obtained under one `sort` value after switching to
another; request a fresh first page instead.

## No `total` field

Paginated responses never include a total count. Computing one requires a separate
counting query on every request, which we do not do by default. If you need a total for a
specific use case, check whether the endpoint offers a dedicated count endpoint before
resorting to counting pages yourself.

## Caching

Paginated responses follow the same [caching contract](/#make-your-first-request) as
every other Insights API response: always re-fetch rather than relying on a locally cached
page while iterating.
