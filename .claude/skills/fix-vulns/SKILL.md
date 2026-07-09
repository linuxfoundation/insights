---
name: fix-vulns
description: >
  Automated triage and fixing of Dependabot security vulnerabilities
  (IN-1189). Starts by asking which scope to tackle (critical, high,
  medium/low, or specific advisories) with checkboxes. Fetches open alerts,
  dedupes them, classifies each by origin (submodule vs local, dev-only vs
  runtime), then fans out one break-risk agent per package that must PROVE the
  update is safe for this codebase before any fix is applied. Applies safe
  fixes one at a time with incremental validation, opens a PR per severity
  tier, and reports everything it did not fix. NEVER merges, never dismisses
  alerts itself, never auto-applies major version bumps. Use when the user says
  "fix vulns", "fix vulnerabilities", "dependabot alerts", "security audit
  fix", or invokes /fix-vulns.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Agent, AskUserQuestion, WebFetch
---

# Fix Dependabot Vulnerabilities

You are triaging and fixing security vulnerabilities in the Insights repo. Walk through each phase in order. Safety rule that overrides everything else: **no fix ships without both a `safe` break-risk verdict (Phase 3) and a green validation suite (Phase 4). Uncertainty is always `risky`, never `safe`.**

---

## Phase 0: Scope selection

Before doing anything else, ask the user which scope to tackle using AskUserQuestion with **multiSelect checkboxes**:

- Question: "Which vulnerabilities should this run tackle?"
- Options (multiSelect: true):
  1. **Critical** — all open critical-severity alerts
  2. **High** — all open high-severity alerts
  3. **Medium + Low** — everything below high
  4. **Specific advisories** — user writes which ones (GHSA ids, CVE ids, or package names) in the note/Other field

If the user picked "Specific advisories", parse the identifiers they wrote. If they were passed as skill arguments (e.g. `/fix-vulns critical` or `/fix-vulns CVE-2026-1234`), skip the question and use the arguments as scope.

## Phase 1: Fetch alerts

Primary source (exact parity with the Dependabot dashboard):

```bash
gh api 'repos/linuxfoundation/insights/dependabot/alerts?state=open&per_page=100' --paginate \
  --jq '[.[] | {number, severity: .security_advisory.severity, pkg: .dependency.package.name,
        scope: .dependency.scope, manifest: .dependency.manifest_path,
        cve: .security_advisory.cve_id, ghsa: .security_advisory.ghsa_id,
        range: .security_vulnerability.vulnerable_version_range,
        patched: .security_vulnerability.first_patched_version.identifier,
        summary: .security_advisory.summary}]'
```

Fallback if the token lacks `security_events` scope: `pnpm audit --json` from the repo root (note in the final report that alert numbers/dismissal parity is unavailable). Filter to the scope chosen in Phase 0.

## Phase 2: Dedupe and classify

1. **Dedupe by GHSA id** — the same advisory appears in both `pnpm-lock.yaml` and `frontend/pnpm-lock.yaml`; collapse into one work item (keep all alert numbers for the report).
2. **Classify each unique package** by dependency origin. Do NOT use `pnpm why -r` — it crashes in this workspace (tree-walker bug with the submodule packages). Instead, get the full consumer chains from audit paths:

   ```bash
   pnpm audit --json | jq -r '.advisories | to_entries[]
     | select(.value.module_name=="<pkg>")
     | .value.findings[].paths[]'
   # e.g. frontend>nuxt>@nuxt/devtools>launch-editor>shell-quote
   # e.g. submodules__crowd.dev__services__libs__integrations>axios>form-data
   ```

   Backup when the package has no advisory entry: `grep -n '<pkg>' pnpm-lock.yaml` and inspect the surrounding entries. Classification:
   - **`submodule-origin`** — every path starts with `submodules__crowd.dev__`. Do NOT fix. Emit a CM-ticket stub (package, CVEs, why it belongs in crowd.dev) and a suggested dismissal command for the user to run:
     `gh api -X PATCH repos/linuxfoundation/insights/dependabot/alerts/<N> -f state=dismissed -f dismissed_reason=not_used -f dismissed_comment="Fix belongs in crowd.dev (CM-XXX)"`
   - **`dev-only`** — reachable only through devDependency chains (vitest, storybook, eslint, …). Fix, but note reduced urgency in the PR.
   - **`runtime`** — reachable from production code. Fix with priority.
3. Record for each package: current locked version(s) (`pnpm list <pkg> --depth Infinity` or lockfile grep), fix target (`patched` from the alert), and whether the target crosses a **semver major** boundary.

Present a short triage table to the user before proceeding: package, severity, classification, current → target, major-hop yes/no.

## Phase 3: Break-risk analysis (agent fan-out)

For every fixable package (not `submodule-origin`), spawn **one agent per package**. When there are more than 3 packages, launch them **in parallel in a single message**. Include in each agent's prompt: the package name, current and target versions, GHSA/CVE ids, and the consumer chains from Phase 2 (the audit paths) — the agent must not re-derive them. Each agent's task — verbatim structure:

> Determine whether updating `<pkg>` from `<current>` to `<target>` can break the Insights codebase. You must produce evidence, not judgment calls. Steps:
> 1. **Usage audit** — search `frontend/app/`, `frontend/server/`, `frontend/nuxt.config.ts`, `frontend/setup/`, and `workers/` for every import/require of `<pkg>`. List each file and the specific APIs/exports used. If nothing imports it directly, say so explicitly.
> 2. **Consumer-range check** (critical for transitive deps) — do NOT use `pnpm why -r`; it crashes in this workspace. From the consumer chains you were given (audit paths), take each **direct parent** of `<pkg>` and read the version range it declares: `jq '.dependencies["<pkg>"] // .devDependencies["<pkg>"] // .optionalDependencies["<pkg>"]' node_modules/.pnpm/<parent>@<version>/node_modules/<parent>/package.json` (find the exact dir with `ls -d node_modules/.pnpm/<parent>@*`). Check whether `<target>` satisfies EVERY parent's range. Any violation → verdict is `risky`, no exceptions.
> 3. **Changelog diff** — fetch the changelog/release notes between `<current>` and `<target>` (GitHub releases, CHANGELOG.md in the repo, or npm). List every breaking change and deprecation. Cross-check each against the APIs found in step 1 and the consumers found in step 2. A breaking change in an API nobody uses is noted but not blocking.
> 4. **Reachability** — is the vulnerable code path from `<ghsa>` reachable in our deployment (SSR server, browser bundle, workers), or is it dev-machine/build-time only?
> 5. **Verdict** — return exactly this structure as your final message:
>    - `verdict`: `safe` | `risky` | `needs-human`
>    - `evidence`: bullet list backing the verdict
>    - `reachability`: one sentence for the PR body
>    - `question`: only if `needs-human` — the specific question a human must answer
>
> Rules: if you cannot obtain a changelog, cannot resolve consumer ranges, or the update crosses a semver major, the verdict is `risky` (or `needs-human` with a question) — NEVER `safe`. `safe` requires positive evidence that no used API changed AND all consumer ranges are satisfied.

Collect all verdicts. Only `safe` packages proceed to Phase 4. `risky` and `needs-human` packages go to the final report with their evidence attached — do not attempt to "rescue" them yourself; that's the human's call.

## Phase 4: Apply fixes sequentially

Work on a branch: `fix/IN-<ticket>-vulns-<severity>` (ask the user for the IN ticket number if unknown; IN-1189 is the parent for this automation). **One package at a time**, in this strategy order:

1. **Direct dep bump** in the owning `package.json` — only if the package is a direct dependency and the fix is within the same major.
2. **`pnpm-workspace.yaml` override** for transitive deps (existing convention — see `h3`, `form-data` already there). Use a range (`'>=x.y.z'`) rather than an exact pin where possible, and keep overrides alphabetized with a trailing comment naming the GHSA id.
3. **`pnpm.patchedDependencies`** only when no fixed release exists — this requires human confirmation first.

After each package: `pnpm install` from the repo root and confirm the lockfile regenerates cleanly and the vulnerable version is gone (`pnpm why <pkg>`).

After the whole batch, run the full validation suite from `frontend/`:

```bash
pnpm tsc-check && pnpm lint && pnpm test && pnpm build
```

**On failure, bisect**: revert all fixes, re-apply one at a time running the full suite each round until the offender is found. Revert the offender, downgrade its verdict to `needs-human` with the failure output attached, and re-validate the remaining set. Never ship a batch that isn't fully green.

## Phase 5: Deliver

- Commit with sign-off and GPG: `git commit --signoff -S -m "fix: bump <pkgs> to resolve <n> security advisories IN-<ticket>"`.
- One PR per severity tier. PR body must contain:
  - A table: GHSA / CVE → package → current → target → fix strategy → classification (`runtime`/`dev-only`) → reachability note (from the break-risk agent).
  - A "Not fixed in this PR" section: every `risky` / `needs-human` / `submodule-origin` package with the agent's evidence or the CM-ticket stub.
  - Link to the IN ticket.
- **Never merge the PR. Never enable auto-merge.** Critical-severity fixes always wait for human review — state this in the PR body.
- Do not push or open the PR without showing the user the branch diff summary and PR body first.

## Phase 6: Report

End with a summary the user can act on without scrolling back:

1. Fixed: packages, CVE count, PR link(s).
2. Needs human decision: each `risky`/`needs-human` package with its one-line reason and evidence pointer.
3. Belongs in crowd.dev: CM-ticket stubs + suggested dismissal commands (never run dismissals yourself).
4. Anything skipped and why. Nothing is silently dropped.

---

## Guardrails (non-negotiable)

- No fix without BOTH a `safe` verdict and a green suite.
- Uncertainty defaults to `risky` — a missing changelog is not permission, it's a blocker.
- Major version bumps are never auto-applied.
- Never touch `submodules/**`.
- Never dismiss alerts, never merge PRs, never push without showing the user first.
