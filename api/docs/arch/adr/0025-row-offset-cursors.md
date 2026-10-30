# ADR-0025: Cursors hold a row offset over a unique sort order

**Date**: 2026-10-30
**Status**: accepted

## Context

[ADR-0011](./0011-pagination-cursor-based.md) made cursors opaque and planned to fill them with a keyset: the last row's sort key and a tiebreaker. Every paginated endpoint shipped with a row offset in the cursor instead, and the keyset benefits do not apply to the data behind them:

- Keyset pages stay exact when rows are added or removed while the other rows keep their sort values. The leaderboards, organization projects and collection projects read tables rebuilt once a day, the OSS Index aggregates rebuild hourly, and categories are static, so offset pages are already stable between rebuilds. Across a rebuild the sort values change, which moves rows across a keyset cursor too. The contributor and organization leaderboards rank by counts that change as activity arrives, with the same effect.
- Keyset costs O(log N) only with an index on the sort key. No pipe has one: the leaderboards aggregate every group on each request, and the copy tables are sorted by other columns. A deep page costs about the same either way.

Four pipes took only `page` and `pageSize`, so the API could not ask for `pageSize + 1` rows starting at any row. It made a separate count query for the vulnerabilities list, read two pipe pages when a cursor fell inside one, and guessed from a full last page on the OSS Index.

## Decision

Cursors keep holding a row offset, encoded as base64url. Every paginated pipe takes row `limit` and `offset` and sorts by a unique key, and the API asks for `pageSize + 1` rows from the cursor's offset, so the extra row decides `nextCursor`. The rest of ADR-0011 stands: opaque cursors, `{ data, pageSize, nextCursor }`, no total, and the default and maximum `pageSize`.

## Alternatives Considered

### Keyset cursors on every endpoint

- **Pros**: pages stay exact when rows are added or removed between requests, and a page costs the same at any depth on an indexed sort key.
- **Cons**: seven pipes need a predicate per sort field and direction (six on `project_repo_insights`), with nullable sort keys and aggregates filtered in `HAVING`.
- **Why not**: the data behind these endpoints changes in batches or by rank, and no sort key is indexed, so neither benefit applies.

### Keep the page-number pipes

- **Pros**: no pipe changes.
- **Cons**: the vulnerabilities list made two or three Tinybird calls per request, and an OSS Index cursor could point to an empty last page.
- **Why not**: Tinybird is the API's capacity limit, so every extra call per request counts.

## Consequences

### Positive

- Every paginated request makes one Tinybird call.
- `lib/pagination.ts` has one path, and cursors issued before this change keep working.
- Clients hold opaque cursors, so any endpoint can move to a keyset later without a breaking change.

### Negative

- An entry added, removed or re-ranked before a caller's position between two requests shifts the later pages, so an entry can be skipped or returned twice. The Pagination guide says so, and route descriptions say pages follow position.

### Risks

- The collections list reads Postgres, where collections change as people edit them, so its pages shift more often than the Tinybird lists. It is the first candidate for a keyset cursor, as is any new list over data that changes between requests.
