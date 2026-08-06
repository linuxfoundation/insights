# Backend Review Checklist

Nuxt server-side API review standards for the Insights repo.

---

## 1. API route file placement (SHOULD FIX)

Routes must live under `frontend/server/api/` and follow Nuxt's file-based routing conventions. The filename determines the HTTP method via `.get.ts`, `.post.ts`, etc.

**Violation:**
```
server/api/projects.ts  ← handles all methods ambiguously
```

**Fix:**
```
server/api/projects/index.get.ts   ← GET /api/projects
server/api/projects/index.post.ts  ← POST /api/projects
server/api/projects/[id].get.ts    ← GET /api/projects/:id
```

---

## 2. Repository pattern for Postgres-backed routes (SHOULD FIX)

The repository pattern (`frontend/server/repo/`) applies to routes that query the **Postgres database** (`cmDbPool`). These include `chat`, `collection`, auth/SSO routes. Raw SQL queries for these should live in a repo class, not inline in the route handler.

**This does NOT apply to Tinybird-backed or GitHub-backed routes** — analytics, organization, and repository routes call upstream APIs inline by design. Do not flag inline Tinybird/GitHub calls as missing the repo pattern.

**Violation (Postgres route):**
```ts
// in server/api/collection/community/my.get.ts
const rows = await cmDbPool.query('SELECT * FROM collections WHERE user_id = $1', [userId])
```

**Fix:**
```ts
// server/repo/communityCollection.repo.ts
export class CommunityCollectionRepository {
  async getUserCollections(userId: string) {
    return cmDbPool.query('SELECT * FROM collections WHERE user_id = $1', [userId])
  }
}

// server/api/collection/community/my.get.ts
const repo = new CommunityCollectionRepository()
const rows = await repo.getUserCollections(userId)
```

---

## 3. Auth middleware — opt-in allowlist in `jwt-auth.ts` (CRITICAL)

`frontend/server/middleware/jwt-auth.ts` runs globally but only enforces authentication on routes that are **explicitly added to its path allowlist**. Currently protected prefixes include: `/api/community/list`, `/api/security/update`, `/api/collection/community`, `/api/collection/like`, `/api/chat`, `/api/report/*` (with specific public exceptions), and `/security/vulnerabilities`.

If a new route should be authenticated, it must be added to the allowlist in `jwt-auth.ts`. Check:
- New routes that access user-specific or sensitive data are in the allowlist
- New public routes are NOT accidentally catching an existing prefix
- Any public exceptions within a protected prefix are explicitly listed

---

## 4. Types defined in `server/types/` (SHOULD FIX)

Server-side type definitions belong in `frontend/server/types/`. Do not define complex interfaces inline in route files.

---

## 5. Error handling — use `createError` (SHOULD FIX)

Use Nuxt's `createError` for HTTP errors. Do not throw plain `Error` objects or manually set response status codes.

**Violation:**
```ts
throw new Error('Not found')
```

**Fix:**
```ts
throw createError({ statusCode: 404, statusMessage: 'Not found' })
```

---

## 6. No secrets or credentials in route handlers (CRITICAL)

API keys, tokens, and credentials must come from `useRuntimeConfig()`, never hardcoded.

**Violation:**
```ts
const apiKey = 'tb_abc123...'
```

**Fix:**
```ts
const config = useRuntimeConfig()
const apiKey = config.tinybirdApiKey
```

---

## 7. Caching headers set appropriately (NIT)

For read-heavy routes, check whether appropriate cache headers are set. The caching rules in `frontend/setup/caching.ts` define route-level cache config — verify new routes follow the same pattern if they are cacheable.

---

## 8. License headers (SHOULD FIX)

Every `.ts` file in `server/` must start with:

```ts
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
```
