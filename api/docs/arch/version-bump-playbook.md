# Version-bump playbook

How to introduce `/v2` of an endpoint while `/v1` stays stable. The registry, routing,
per-version OpenAPI documents, and deprecation headers are already built; this playbook
is the procedure for using them. "v1 to v2" is used throughout, and the same steps
apply to any major bump. Moving an endpoint from `/v1-alpha` to `/v1` is a promotion
rather than a bump; the last section covers it.

## When a bump is required

[Endpoint lifecycle](../site/lifecycle.md) promises callers that a version only ever
changes additively: new fields, new optional params, new endpoints, new error codes,
and expanded accepted enum input values. A change breaks that promise, and therefore
requires a new major version, when it matches the committed Breaking Change definition
in [CONTEXT.md](CONTEXT.md):

- removes or renames a field, param, endpoint, or enum value
- changes a field's type or format
- tightens a constraint (an optional param becomes required, a `sort` allow-list loses
  a value)
- changes the meaning of an existing field or status code
- changes the error envelope shape
- changes the default or max `pageSize`, or the cursor encoding semantics
- changes an endpoint's default `sort` value

Additive changes ship inside `/v1` directly; stop here for those.

## Step 1: implement v2 as a sparse version

Create `src/versions/v2/index.ts` exporting a `FastifyPluginAsyncTypebox`, mirroring
`src/versions/v1/index.ts`. Implement only the endpoints whose contract breaks. v2 is
sparse by design: callers use `/v2/foo` for the bumped endpoint and keep calling
`/v1/bar` for everything else, so a bump stays a per-endpoint decision instead of a
fork of the whole surface.

Keep queries and business logic shared upstream of both version plugins; isolate the
contract difference itself in a version-specific mapper, with the v2 handler importing
a `v2Mapper` next to the `v1Mapper` the v1 handler already uses. Duplicating logic
instead of sharing it upstream is how the two versions drift apart.

## Step 2: register the prefix

Add the version to `versionRegistry` in `src/versions/registry.ts`:

```ts
export const versionRegistry: ApiVersion[] = [
  { prefix: '/v1', plugin: v1Routes },
  { prefix: '/v2', plugin: v2Routes },
];
```

The registry loop in `src/app.ts` gives the rest for free: routing under `/v2/`, a
`/v2/openapi.json` document with `info.version` `2.0.0` (see `specVersionFor`)
containing only v2 paths and only the schemas those paths reach, and the same for the
export script (`scripts/export-openapi.ts`).

## Step 3: prove v1 stable

The stability bar for the bump PR: registering `/v2` leaves every `/v1` response
byte-identical in status, body, and headers, and leaves `/v1/openapi.json` unchanged.
Routing isolation is pinned by `tests/version-routing.test.ts` and
`tests/openapi-versions.test.ts`; the PR must show the v1 route handlers and schemas
untouched, and any shared helper it edits needs the existing suites to stay green.

## Step 4: signal the deprecation, later and deliberately

Registering v2 says nothing to v1 callers, on purpose.

Setting `lifecycle` on a registry entry is prefix-wide: the registry loop in
`src/app.ts` calls `applyLifecycle` once per version scope, so every `/v1` route picks
up the `Deprecation`, `Sunset`, and `Link` headers, including routes that never got a
`/v2` successor. Because v2 stays sparse by design (step 1), only deprecate `/v1` once
every supported `/v1` route has a `/v2` counterpart; stamping the whole prefix while v2
covers a handful of endpoints tells callers of untouched routes to migrate to a version
that doesn't serve them. Deprecating one endpoint ahead of full v2 coverage needs
route-scoped lifecycle metadata, which doesn't exist yet; that gap is the same
follow-up noted below, under Retiring the old version.

Once the migration guide is published and v2 has a route for every supported v1
endpoint, deprecate v1 by adding lifecycle metadata to its registry entry:

```ts
{
  prefix: '/v1',
  plugin: v1Routes,
  lifecycle: {
    deprecatedAt: '2027-01-15',
    sunsetAt: '2027-07-15',
    successorPrefix: '/v2',
    deprecationDocsUrl: 'https://api.insights.linuxfoundation.org/docs/migrate-v2',
  },
}
```

Every `/v1` response then carries `Deprecation`, `Sunset`, and `Link` headers in the
[ADR-0021](adr/0021-rfc-deprecation-sunset-header-formats.md) wire formats. Headers
are additive: bodies and status codes stay exactly as they were, and
`tests/version-lifecycle.test.ts` pins that behavior. Invalid dates fail the build at
startup, so a bad `lifecycle` entry cannot reach production silently.

## Step 5: communicate

- Add a [changelog](../site/changelog.md) entry announcing `/v2` and what changed.
- Publish the migration guide at the `deprecationDocsUrl` before setting `lifecycle`.
- State the sunset window in both. ADR-0003 gates the sunset itself: `/v1` is removed
  only after `/v2` has been stable for a publicly announced minimum period, which the
  ADR leaves TBD and calls at least six months conventional. Settle both numbers, the
  caller notice window and that `/v2` stability period, and record them in
  [Endpoint lifecycle](../site/lifecycle.md) before scheduling the deprecation.

## Retiring the old version

Removing an entry from `versionRegistry` takes its whole prefix down at once, so only
retire `/v1` once `/v2` covers every route `/v1` still serves. ADR-0003 commits to
keeping a `/v1` endpoint alive, even as a stub, until `/v1` is fully sunset; pulling the
prefix while an unbumped endpoint has no `/v2` replacement breaks that promise. Once
coverage is complete and the sunset date passes, follow the pattern of
[promoting an alpha endpoint](#promoting-an-endpoint-from-v1-alpha-to-v1): the retired
routes answer `410 Gone` with a `Link: </v2/...>; rel="successor-version"` header for a
grace window, then the version is removed from the registry. Retiring a single endpoint
while `/v1` still serves others needs the same route-scoped mechanism step 4 needs for
deprecation; the mechanics for that step are a follow-up, and nothing in this repo
automates it yet.

## Verification checklist

Before merging a bump PR, from `api/`:

1. `pnpm test` green, in particular `tests/version-routing.test.ts` (prefix isolation),
   `tests/openapi-versions.test.ts` (per-version specs), and
   `tests/version-lifecycle.test.ts` (deprecation headers).
2. `pnpm tsc-check` and `pnpm lint` green.
3. Diff shows v1 handlers and schemas untouched (step 3's stability bar).
4. `/v2/openapi.json` reviewed: only the bumped endpoints, `info.version` `2.0.0`.
5. Changelog entry and migration guide linked (step 5).

## Promoting an endpoint from `/v1-alpha` to `/v1`

Promotion moves one endpoint from `/v1-alpha` to `/v1` within the same major version.
[ADR-0003](adr/0003-tolerant-reader-versioning.md) sets the promotion criteria and
[Endpoint lifecycle](../site/lifecycle.md) tells callers what to expect; this section is
the procedure. It works route by route, so keep `lifecycle` off the `/v1-alpha` registry
entry: that field stamps every route under the prefix, including endpoints still in
alpha, and a promoted alpha route answers `410` instead of carrying deprecation headers.

### Step 1: settle the shape in alpha

The alpha response shape becomes the `/v1` contract the day the route moves, and from
then on only additive changes are allowed. Land any rename or cleanup under `/v1-alpha`
before promoting; each shape change restarts the week of stable use ADR-0003 requires.

### Step 2: move the route to `/v1`

Move the route module from `src/versions/v1-alpha/` to `src/versions/v1/` and register it
in the `/v1` plugin, with its schemas and handler unchanged. The prefix filter in the
registry loop in `src/app.ts` then lists the path in `/v1/openapi.json` and drops it
from `/v1-alpha/openapi.json`.

The `/v1-alpha` plugin sets `Cache-Control: private, max-age=0` in an `onRequest` hook,
which [ADR-0013](adr/0013-origin-cache-only-private-cache-control.md) requires on every
response. The `/v1` plugin has no hook until its first route arrives, so the first
promotion adds the same hook there.

### Step 3: answer `410 Gone` on the alpha path

Replace the alpha route with a stub on the same method and path that answers `410` with
a `Link` to its successor:

```ts
const projectRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  // Promoted to /v1 on 2026-10-05; delete after 2026-10-19 (two weeks, see lifecycle.md).
  scope.get('/projects/:slug', { schema: { hide: true } }, async (request, reply) => {
    const successor = request.url.replace(/^\/v1-alpha\//, '/v1/');
    reply.header('link', `<${successor}>; rel="successor-version"`);
    throw new GoneError(`This endpoint moved to ${successor}`);
  });
};
```

- Rewriting `request.url` keeps the path params and the query string, so the `Link`
  names the exact `/v1` request the caller should make.
- `hide: true` keeps the stub out of `/v1-alpha/openapi.json`, the same way the registry
  loop hides each version's own `openapi.json` route.
- Throwing sends the `410` down the path every other error takes, so the body follows
  the [error envelope](../site/errors.md) once it lands, and headers set before the throw
  are kept. The first promotion adds `GoneError` (`statusCode = 410`, `code = 'gone'`)
  next to `NotFoundError` in `src/lib/errors.ts`, and a `410` / `gone` row to the codes
  table in `errors.md`.

### Step 4: add the new test cases

- Add a case that the alpha path answers `410` with the successor `Link`, path params
  and query string included, and that `/v1-alpha/openapi.json` no longer lists it.
- For the first `/v1` route, add a case that it sends `Cache-Control: private, max-age=0`.

### Step 5: communicate

- Add a dated [changelog](../site/changelog.md) entry that lists the `/v1` route under
  **Added** and says it was promoted from `/v1-alpha`.
- Notify the alpha cohort directly with the new URL and a migration note, per ADR-0003.

### Step 6: delete the stub after two weeks

Endpoint lifecycle promises the `410` for at least two weeks. After that, delete the stub
and its test case; the alpha path then answers `404` like any unknown path. The
`/v1-alpha` prefix stays registered, since new endpoints keep launching under it.
