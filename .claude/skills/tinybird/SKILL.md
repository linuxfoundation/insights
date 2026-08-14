---
name: tinybird
description: >
  Update, deploy, or roll out a Tinybird pipe or datasource to staging or
  production. Use for "update a pipe", "push to Tinybird", "tb push", "tb
  pull", "change a datasource", "add a field to a pipe", or anything touching
  the `lfx_insights` / `lfx_insights_stg` Tinybird workspaces.
allowed-tools: Bash, Read, Edit, Glob, Grep, AskUserQuestion
---

# Tinybird Pipe / Datasource Update

Tinybird resources (`.pipe`, `.datasource`) live in **crowd.dev**, not this repo — Insights just
consumes them. This skill drives the edit-and-deploy cycle from here; interactive or destructive
steps are handed back to you.

**Out of scope** — local Docker testing, backfills, schema iteration, backup datasources. Those
stay in `submodules/crowd.dev/services/libs/tinybird/README.md` (and its siblings
`dataflow.md`, `lambda-architecture.md`, `bucketing-architecture.md`) — read that file, don't
attempt those flows here.

## Guardrails

- Never run `tb push` against `lfx_insights` (prod) without showing the diff and the exact command
  and getting an explicit yes first.
- Never delete a datasource, and never run `tb push --populate` — those are the
  downtime-causing / backfill paths documented in the README, out of scope for this skill.
- Never edit anything under `submodules/crowd.dev` — that's a pinned, detached submodule checkout.
  All work happens in the standalone crowd.dev checkout (step 1).
- Never print `.tinyb` wholesale or echo a token — it holds a live admin credential. Only report
  `host` / `name` / `user_email` from it.

## 1. Locate the crowd.dev checkout

Try in order:
1. `$CROWD_DEV_PATH` env var
2. Sibling of this repo: `../crowd.dev` relative to the insights repo root
3. Ask the user for the path

Verify it looks right: `services/libs/tinybird/README.md` should exist under it. If only
`submodules/crowd.dev` is found, stop and tell the user you need the standalone checkout.

All commands below run from `<crowd.dev>/services/libs/tinybird`.

## 2. Environment

```bash
cd <crowd.dev>/services/libs/tinybird
source .venv/bin/activate
tb --version   # expect 5.x — ignore the "upgrade to 6.x" nag, that's a different product line
```

If `.venv` doesn't exist yet:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Auth — hand back to the user

`tb auth` is interactive; you cannot drive it. Check whether a session already exists by reading
`.tinyb` and reporting only `host` / `name` / `user_email` (never the token). If not authenticated,
ask the user to run it themselves via the `!` prefix:

```
! cd <crowd.dev>/services/libs/tinybird && source .venv/bin/activate && tb auth
```

## 4. Select the workspace

```bash
tb workspace ls
tb workspace use lfx_insights_stg   # staging/dev
tb workspace use lfx_insights       # production
```

`.tinyb` persists the last-selected workspace across sessions — **always echo the current
workspace back before any mutating command**, don't assume it's still pointed where you left it.

## 5. Get the change into files

Either edit the `.pipe` / `.datasource` file directly under `pipes/` or `datasources/`, or — if the
resource was authored/edited in the staging UI first — pull it while pointed at
`lfx_insights_stg`:

```bash
tb pull --force --match <resource_name>
```

## 6. Format

Must be run from `scripts/` (it uses relative `../pipes` / `../datasources`). Use `--match` so the
diff stays scoped to the resource you touched:

```bash
cd scripts && ./format.sh --match <resource_name>
```

Then confirm scope: `git diff` should touch only the intended resource.

## 7. Deploy to staging

```bash
tb push pipes/<name>.pipe          # or datasources/<name>.datasource
# add --force if overwriting an existing resource — call this out explicitly when you do
```

## 8. PR

Branch and commit in the crowd.dev repo, following this repo's `commit-workflow.md` conventions
(conventional commit type, `--signoff -S`, `IN-XXX` inline in the message). Note: crowd.dev's
Tinybird CI (`tinybird-ci.yml`) only checks `tb fmt --diff` — a green CI does not mean the SQL
itself is correct, say so if asked.

## 9. Deploy to production

```bash
tb workspace use lfx_insights
```

Show the resource diff and the exact `tb push` command, and get an explicit yes before running it.

## Reference

- Full doc: `submodules/crowd.dev/services/libs/tinybird/README.md` — architecture overview
  (Lambda vs Bucketing), local Docker testing, data iteration, backup datasources.
- Workspaces: `lfx_insights_stg` (staging), `lfx_insights` (production), host
  `https://api.us-west-2.aws.tinybird.co`.
