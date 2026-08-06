# Pagination is cursor-based with opaque base64url cursors

All paginated endpoints accept `cursor` (opaque base64url string, omit on the first request) and `pageSize` (integer, default 50, max 200) as query parameters, and return `{ data, pageSize, nextCursor }`. `nextCursor: null` indicates the end of the list. There is no `total` field and no page number.

## Why cursor-based instead of page + pageSize

The previous design ported the Nuxt convention (`page` + `pageSize` zero-indexed, `total` from Tinybird's `rows_before_limit_at_least`). That decision was driven by minimising port-time translation cost, not by what is right for a public API contract. Four reasons flip the trade-off:

1. **Stability under mutations — no duplicates or missed entries.** Offset pagination produces corrupt iteration when the underlying set changes between page fetches. Concretely: if an item is inserted between fetching page N and page N+1, every subsequent row shifts one position forward. The item that was the first entry of page N+1 slides back into the last position of page N — which we already fetched — so it is silently skipped. The reverse happens on deletion: the item that was the last entry of page N drops into the first position of page N+1, so it appears in both pages. A cursor anchors to a row's sort-key value rather than its offset, so insertions and deletions between calls never affect which rows the caller sees next. This API serves analytics over data that grows continuously — commits, contributors, vulnerabilities — making offset instability a practical concern, not a theoretical one.

2. **Cost at scale.** `LIMIT N OFFSET M` is O(N+M): Tinybird and Postgres scan the skipped rows. A cursor query (`WHERE (sort_key, id) < (:cursor_k, :cursor_id) ORDER BY sort_key DESC, id ASC LIMIT N`) is O(log N) on an indexed key. The first and the hundredth page cost the same.

3. **Fit for the caller.** v1 is server-to-server only: pipelines, dashboards, batch jobs. They iterate end-to-end. They do not render a "page 5 of 23" UI. Cursor-based fits that shape; offset is a UI affordance we do not need.

4. **Industry convention.** Stripe, GitHub, AWS, Linear, and Slack all use cursor-based pagination for their public APIs.

## No `total` field

Computing a total count alongside every paginated result requires a separate `count(*)` query, doubling Tinybird load per request. The cursor model makes this unnecessary for the primary use case (iterate all records). If a specific caller needs a total count we can add a dedicated `/count` endpoint — we will not add it speculatively in v1.

## Cursor encoding

The cursor is `base64url(JSON.stringify({ k: <last sort-key value>, id: <tiebreaker id> }))`. It is server-generated and server-opaque: clients must not parse, construct, or store cursors as structured data. They pass back the `nextCursor` value verbatim. Opacity means the server can change the internal encoding (add fields, switch format) without issuing a breaking change.

## Lookahead trick — no second count query

Tinybird queries fetch `pageSize + 1` rows. If the result set has `pageSize + 1` rows, there is a next page: drop the last row from the response, encode its `(sort_key, id)` as the `nextCursor`. If the result set has `≤ pageSize` rows, set `nextCursor: null`. No second query needed.

## Default and max pageSize

- Default: `pageSize = 50`
- Maximum: `pageSize = 200`

Changing either value is a breaking change per ADR-0003. Tune based on RPS and Tinybird query latency data once available.

## Non-paginated endpoints

Top-N leaderboards (hard-capped result sets), single-row lookups, and time-series charts are not paginated. Cursor pagination applies only to list endpoints that would previously have returned `{ data, page, pageSize, total }` or equivalent `limit`/`offset` shapes.

## Sort order

Sort order is **caller-selectable from a per-endpoint allow-list.** Every paginated endpoint declares a closed set of accepted `sort` values in its TypeBox schema; a value outside the list returns `400 invalid_sort`. Each accepted value must be backed by a Tinybird or Postgres index — sort keys with no index are not added, since server-side resorting would break the O(log N) cost argument.

Wire format: `?sort=<field>_<direction>`, e.g. `name_asc`, `commits_desc`. This mirrors the existing Nuxt convention (`frontend/server/api/project/index.ts`, `frontend/server/api/collection/index.ts`, `frontend/server/api/ossindex/collections.ts`) so port-time conversion is mechanical.

The cursor still encodes `(sort_key_value, id)`. The `sort_key_value` is whichever field the caller selected. The cursor is opaque — callers must not mix cursors across `sort` values; this is documented in the OpenAPI parameter description for each endpoint.

**Adding** a value to an endpoint's allow-list is additive (non-breaking). **Removing** a value or **changing the default** is a breaking change per ADR-0003.

Sort direction (`asc`/`desc`) is selectable only where both directions are indexed; otherwise the endpoint locks direction in its allow-list (e.g. `name_asc` only).

Each endpoint's allowed `sort` values and its default are documented in the OpenAPI spec for that route.

## Port-time conversion

The `nuxt-to-api` skill rewrites Nuxt `page`/`pageSize`/`total` handlers — and `limit`/`offset` handlers — into cursor-based handlers at port time, including the lookahead-LIMIT pattern in the Tinybird query. Existing `sort` parameters from Nuxt handlers are preserved as-is (same `field_direction` wire format).
