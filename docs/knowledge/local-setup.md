---
type: runbook
slug: runbook-local-setup
name: Local setup across Insights and CDP
repo: insights
owner: Insights team
depends_on: [sys-insights, contract-insights-cdp]
used_by: []
sources:
  - .claude/skills/setup/SKILL.md
  - init-submodules.sh
  - frontend/setup/runtime-config.ts
---

# Local setup across Insights and CDP

Each repository already has a full setup guide:

- **Insights**: the `/setup` skill (`.claude/skills/setup/SKILL.md`) walks through prerequisites,
  environment variables, the optional local Postgres on port 5450 with migrations, and the dev
  server. Use it directly; this note does not repeat it.
- **CDP**: `README.md` in the crowd.dev repository, `cd scripts && ./cli start`.

This note covers only where the two meet.

## You do not need CDP running to work on Insights

Insights reads its data from Tinybird with a token from the team (`NUXT_TINYBIRD_TOKEN`), so the
site works locally without any CDP service. The only CDP code you need is the submodule. Only the
workers import it, but the pnpm workspace links it, so it has to be present for any install:

```sh
./init-submodules.sh      # or --https without SSH keys
pnpm install
```

Run `init-submodules.sh` before `pnpm install`; without the submodule the install cannot resolve
the `@crowd/*` packages. The checkout is sparse, so only the libraries Insights uses are fetched.

## When you do need CDP's database

Collections, collection likes and SSO users live in CDP's Postgres. To work on those features:

- set `NUXT_CM_DB_ENABLED=true` in `frontend/.env`; it is off locally and on in production;
- point the `cmDb*` settings (`NUXT_CM_DB_*`) at a CDP database, either a local one started by
  `./cli start` in crowd.dev or credentials from the team.

The public API reads the same tables through `API_CM_DB_*`, and `package_downloads_worker` through
`CM_DB_*`. The three components use three different prefixes for the same database; see the
contract.

## When you change a `@crowd/*` library

Editing inside `submodules/crowd.dev` changes CDP code, and that change has to land in the
crowd.dev repository. Because deploys resolve the submodule to CDP's `main`, Insights picks it up
on the next deploy after it merges there, with no change on this side.
