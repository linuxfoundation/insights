# Collections Postgres queries are written fresh in `/api`, not shared with the frontend

The `/api` service writes its own minimal read-only Postgres queries for the Collections endpoints rather than extracting `frontend/server/repo/communityCollection.repo.ts` into a shared library.

## Considered Options

- **Shared `libs/collections-repo`** — rejected: the frontend repo is 762 lines, write-heavy (create, update, delete, like), and coupled to Nuxt path aliases (`~~/server/utils/common`). Extracting it would require stripping Nuxt dependencies and carrying write operations that `/api` will never use. The coupling risk outweighs the DRY benefit.
- **Fresh queries in `/api` (chosen)** — the public API needs ~3 read queries in v1: get collection by slug, list collections, permission check (`isPrivate` + `ssoUserId`). Writing these directly keeps `/api` self-contained and avoids a shared library that exists only because two services query the same table.

## Consequences

- If the `collections` table schema changes, both the frontend repo and the `/api` queries need updating. This is acceptable — schema changes are rare and infrequent, and both sites need to be reviewed anyway.
- Engineers seeing what looks like duplicated SQL should not reflexively extract a shared repo. The duplication is deliberate: the frontend owns write operations, the API owns read operations, and they have different dependency contexts.
- If a third consumer of the collections table emerges, revisit this decision.
