---
name: preflight
description: >
  Pre-PR validation — license headers, format, lint, TypeScript check, build,
  and protected file check. Use before submitting any PR, to check if code is
  ready, validate changes, or verify a branch before review.
allowed-tools: Bash, Read, Glob, Grep, AskUserQuestion
---

# Pre-Submission Preflight Check

You are running a comprehensive validation before submitting a pull request.
Run each check in order, report results clearly, and help fix any issues found.

All script commands run from the `frontend/` directory unless otherwise noted.

## Check 0: Working Tree Status

Before running any validation, check the state of the working tree:

```bash
git status
git diff --stat origin/main...HEAD
git log --format="%h %s%n%b" origin/main...HEAD
```

**Evaluate:**

- **Uncommitted changes?** — Ask the contributor: commit now or stash?
- **No commits ahead of main?** — The branch has nothing to validate. Ask if they're on the right branch.
- **Commit messages missing JIRA ticket?** — Flag commits that don't include `IN-` references inline in the description.
- **Commits missing `--signoff`?** — Flag any commits without `Signed-off-by:` lines.

Resolve any issues before proceeding.

## Check 1: License Headers

Every source file (`.ts`, `.vue`, `.js`, `.scss`) must have the copyright header. Check for files missing it:

```bash
# From repo root
find frontend/app frontend/server -type f \( -name "*.ts" -o -name "*.vue" -o -name "*.js" -o -name "*.scss" \) | \
  xargs grep -rL "Copyright" 2>/dev/null | grep -v node_modules | grep -v ".nuxt" | head -20
```

The correct headers are:
- **TypeScript / JS / SCSS**: `// Copyright (c) 2025 The Linux Foundation and each contributor.` + `// SPDX-License-Identifier: MIT`
- **Vue files**: `<!--\nCopyright (c) 2025 The Linux Foundation and each contributor.\nSPDX-License-Identifier: MIT\n-->`

If any files are missing headers, add them using the `scripts/add-license.js` script or manually.

## Check 2: Formatting

```bash
cd frontend && pnpm format
```

This applies Prettier formatting. Run format before lint to eliminate whitespace noise from the lint step.

If files were modified, stage them:

```bash
git add -p
```

## Check 3: Linting

```bash
cd frontend && pnpm lint
```

If there are lint errors, fix them. Common issues:

- Unused imports or variables
- Missing type annotations
- Vue template rule violations

### Re-validation

If any fixes were applied in Checks 1–3, re-run lint to confirm fixes are clean:

```bash
cd frontend && pnpm lint
```

## Check 4: TypeScript Check

```bash
cd frontend && pnpm tsc-check
```

Fix any type errors before proceeding. Common issues:

- Missing types on function parameters
- Incorrect return types
- Import path issues

## Check 5: Build Verification

```bash
cd frontend && pnpm build
```

The build must succeed. If it fails:

- Check for TypeScript errors not caught by `tsc-check`
- Verify all imports resolve correctly
- Check for circular dependencies

## Check 6: Protected Files Check

Verify no protected infrastructure files were modified:

```bash
git diff --name-only origin/main...HEAD
```

**Flag any changes to these files** — they should NOT be modified without code owner approval:

- `frontend/nuxt.config.ts`
- `frontend/setup/modules.ts`, `vite.ts`, `runtime-config.ts`, `primevue.ts`
- `frontend/server/middleware/*`
- `frontend/app/plugins/auth.client.ts`, `vue-query.ts`
- `frontend/server/middleware/jwt-auth.ts`
- `frontend/package.json`, `package.json`, `pnpm-lock.yaml`
- `CLAUDE.md`, `.claude/settings.json`
- `scripts/add-license.js`, `COPYRIGHT_HEADER.txt`, `COPYRIGHT_HEADER_vue.txt`
- `.husky/*`, `eslint.config.*`, `.prettierrc*`

If protected files appear in the diff, warn the contributor and ask them to revert or get code owner approval.

## Check 7: Commit Verification

```bash
git status
git log --format="%h %s%n%b" origin/main...HEAD
```

- **All changes committed?** — If not, remind them to commit.
- **Commit messages follow conventions?** — `type: description` format per `commit-workflow.md`. Scope is optional. Valid types include `feat`, `fix`, `docs`, `chore`, `refactor`, `build`, etc.
- **`--signoff` on all commits?** — Every commit must have `Signed-off-by:`.
- **JIRA ticket referenced?** — Commit messages should include `IN-` references inline in the description.

## Check 8: Change Summary

Generate a summary of all changes for the PR description:

```bash
git diff --stat origin/main...HEAD
```

List:

1. **New files created** — with their purpose
2. **Modified files** — with what changed
3. **Server API changes** — any new or modified routes in `server/api/`
4. **Component changes** — any new or modified components
5. **Data/query changes** — any TanStack Query or Pinia store changes

## Results Report

Present a clear report:

```text
PREFLIGHT RESULTS
─────────────────────────────────
✓ Working tree        — Clean, N commits ahead of main
✓ License headers     — All files have headers
✓ Formatting          — Applied
✓ Linting             — No errors
✓ TypeScript          — No errors
✓ Build               — Succeeded
✓ Protected files     — None modified
✓ Commits             — Conventions followed, signed off
─────────────────────────────────
READY FOR PR
```

Or if there are issues:

```text
PREFLIGHT RESULTS
─────────────────────────────────
✓ Working tree        — Clean, N commits ahead of main
✗ License headers     — 2 files missing headers (see above)
✓ Formatting          — Applied
✗ Linting             — 3 errors (see above)
✓ TypeScript          — No errors
✗ Build               — Failed (see above)
✓ Protected files     — None modified
✓ Commits             — Conventions followed, signed off
─────────────────────────────────
ISSUES FOUND — Fix before submitting
```

### If All Checks Pass

Suggest creating the PR:

> "All preflight checks passed! Ready to create a PR. Would you like me to create it with `gh pr create`?"
