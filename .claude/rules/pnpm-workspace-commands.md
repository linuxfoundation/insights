# pnpm Workspace Commands

This is a pnpm monorepo. All package management and script execution must follow workspace conventions.

## Rules

1. **Always use `pnpm`** — never `npm`, `npx`, or `yarn`

2. **Run installs from the repo root with a workspace filter:**
   ```sh
   pnpm install --filter frontend
   ```
   Never `cd frontend && pnpm install`

3. **Run scripts from the `frontend/` directory** (dev server, build, lint, test):
   ```sh
   cd frontend && pnpm dev
   cd frontend && pnpm build
   cd frontend && pnpm lint
   cd frontend && pnpm test
   cd frontend && pnpm tsc-check
   ```

4. **Never use `npm run *`** — `.claude/settings.json` only allows `Bash(pnpm *)` and git commands, and pnpm is the required tool for this repo

## Common Commands Reference

| Task | Command (from `frontend/`) |
|---|---|
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Type check | `pnpm tsc-check` |
| Lint | `pnpm lint` |
| Lint + fix | `pnpm lint:fix` |
| Format | `pnpm format` |
| Tests | `pnpm test` |
| Storybook | `pnpm storybook` |

## Why

pnpm workspaces manage shared dependencies and hoisting. Using npm or yarn will bypass lockfile integrity and may install incorrect dependency versions.
