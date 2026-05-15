---
name: review-pr
description: >
  Review a pull request against Insights architecture standards — fetches PR
  diff, verifies previous comments are addressed, validates PR metadata (title,
  branch, JIRA, size), runs a code-standards check against every file in
  `.claude/rules/` and `.claude/hooks/guard-protected-files.sh`, and drafts
  inline review comments with suggested fixes. NEVER auto-posts comments or
  submits reviews — always presents a draft in the terminal for user approval
  before any comment lands on the PR. Use when reviewing PRs, checking PR
  quality, validating code changes, or when the user says "review", "check this
  PR", or "audit code".
allowed-tools: Bash, Read, Glob, Grep, Agent, AskUserQuestion, Skill
---

# Insights PR Review

You are reviewing a pull request against the Insights architecture standards and project conventions. Walk through each phase in order.

The review is backed by these living sources of truth — always pull current contents rather than relying on memory:

- `.claude/rules/*.md` — all project rules
- `.claude/hooks/guard-protected-files.sh` — the authoritative protected-files list
- `CLAUDE.md` — project conventions

---

## Phase 1: Input & Context Gathering

### Parse arguments

The args string follows this format: `<PR number> [extra instructions]`.

- First token is the PR number if numeric.
- Everything after it is extra instructions (e.g. "focus on backend", "check that previous comments were addressed").
- If no PR number is provided, use **AskUserQuestion** to ask for one.

### Determine repository

```bash
gh repo view --json nameWithOwner --jq '.nameWithOwner'
```

### Fetch PR metadata (parallel)

Run all of the following in a single turn:

```bash
# PR details
gh pr view <N> --json title,body,headRefName,baseRefName,author,files,additions,deletions,state,number

# Full diff
gh pr diff <N>

# Previous inline review comments
gh api repos/{owner}/{repo}/pulls/{N}/comments --paginate

# Previous review summaries
gh api repos/{owner}/{repo}/pulls/{N}/reviews --paginate

# Commit messages
gh api repos/{owner}/{repo}/pulls/{N}/commits --paginate --jq '.[].commit.message'

# Fetch both branches for merge-base check
git fetch origin <baseRefName> <headRefName>
```

If the diff is too large, save it to `/tmp/pr-<N>.diff` and read only changed `.ts`, `.vue`, `.scss`, `.md` files with `Read`.

### Load all project rules (dynamic — do not hardcode)

Glob `.claude/rules/*.md` and read every rule file. At time of writing this includes:

- `always-use-uikit.md` — uikit component usage rules
- `pnpm-workspace-commands.md` — pnpm workspace conventions
- `commit-workflow.md` — PR title format, branch naming, JIRA, signing

### Load the protected-files hook

Read `.claude/hooks/guard-protected-files.sh`. Parse its `case` statements and `if` conditions to build the authoritative protected-files list. Never maintain it by hand — parse the hook so it stays in sync.

---

## Phase 2: Launch Code Enforcer (background)

Spawn a background **Agent** subagent with `run_in_background: true`. Proceed to Phase 3 immediately while it runs in parallel.

Prompt for the agent:

> You are a code-standards enforcer for the Insights codebase (Nuxt 4 / Vue 3 / TypeScript).
>
> **Branch:** `origin/<headRefName>`
> **Changed files:** (include the full list from Phase 1)
>
> For each file, read it with `git show origin/<headRefName>:<path>` and check against:
>
> 1. `.claude/rules/*.md` — glob and read all rule files
> 2. `.claude/skills/review-pr/references/frontend-checklist.md` — for files under `frontend/app/`
> 3. `.claude/skills/review-pr/references/backend-checklist.md` — for files under `frontend/server/`
> 4. `CLAUDE.md` — project conventions
>
> Also read `.claude/hooks/guard-protected-files.sh` and parse its `case`/`if` patterns. For every changed file matching a protected pattern, emit a NIT finding with the hook's warning reason.
>
> **Severity calibration:**
> - **CRITICAL** — runtime bugs, security issues, secrets in code, broken auth, missing `createError` for HTTP errors
> - **SHOULD_FIX** — documented style/structure violations (raw HTML instead of uikit, Options API, missing license headers, `space-y-*` instead of `gap-*`, `any` type, inline DB queries instead of repo pattern)
> - **NIT** — minor improvements, naming, protected-file awareness
>
> Return findings as JSON:
> `[{ "file": "...", "line": N, "severity": "CRITICAL|SHOULD_FIX|NIT", "rule": "<rule-file>:<section>", "message": "...", "suggestion": "..." }]`
>
> If you cannot quote the rule from a loaded rule file or checklist, drop the finding. Hallucinated rules are worse than missed ones.

---

## Phase 3: Verify Previous Review Comments

Check whether previously raised review comments were actually addressed in code. **Do NOT trust "resolved" status — read the actual code.**

1. Gather all inline comments and review bodies from Phase 1.
2. Skip trivial comments: nits, "+1", bot auto-comments, purely informational remarks.
3. For every **CRITICAL** or **SHOULD FIX** comment:
   1. Read the file on the PR branch: `git show origin/<headRefName>:<file>`
   2. Compare current code against what the comment requested.
   3. Classify: **FIXED** / **NOT FIXED** / **PARTIALLY FIXED** / **N/A**
4. Build a markdown table:

```markdown
| #   | Comment Summary          | File                        | Status    | Evidence                     |
| --- | ------------------------ | --------------------------- | --------- | ---------------------------- |
| 1   | Use lfx-button not button | app/components/Foo.vue      | FIXED     | Line 12 now uses lfx-button  |
| 2   | Missing license header   | server/api/projects.get.ts  | NOT FIXED | File still has no header     |
```

If no previous review comments, note "No previous review comments found" and move on.

---

## Phase 4: PR Metadata Validation

Validates PR metadata against `commit-workflow.md`.

### Checks

1. **PR title format** — must match `type: description` (Conventional Commits), all lowercase, no JIRA ticket in title. A scope is optional.
   - Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

2. **Branch name format** — should match `<type>/IN-<number>` (e.g. `feat/IN-123`). Flag as NIT if non-conforming but otherwise well-formed.

3. **JIRA ticket reference** — at least one commit message or the PR body should reference an `IN-XXX` ticket. Extract with `grep -oE 'IN-[0-9]+'`. If none, flag SHOULD FIX.

4. **Branch rebased on main**:
   ```bash
   git merge-base --is-ancestor origin/main origin/<headRefName>
   ```
   If non-zero exit code, flag SHOULD FIX: branch needs a rebase.

5. **PR size** — if `additions > 1000`, note per `commit-workflow.md`'s 1000-line target.

Build a findings table:

```markdown
| Check           | Status | Detail                                     |
| --------------- | ------ | ------------------------------------------ |
| PR title format | PASS   | `feat(auth): add token refresh`            |
| Branch name     | PASS   | `feat/IN-1234`                             |
| JIRA ticket     | PASS   | Found IN-1234 in commits                   |
| Branch rebased  | PASS   | origin/main is an ancestor                 |
| PR size         | PASS   | 342 additions                              |
```

---

## Phase 5: Compile Context

Wait for the Phase 2 enforcer Agent to complete. Then compile all findings.

### Apply false-positive filter

Before surfacing any finding, drop it if:
- The `rule` field cannot be matched by string search in the loaded rule files, checklists, or hook
- It relates to a pattern that doesn't exist in this codebase (e.g. Angular-specific rules)

### Assemble the context block

1. **Previous comment verification** — Phase 3 table (or "No previous review comments found")
2. **PR metadata validation** — Phase 4 table
3. **Protected files touched** — list any matching `.claude/hooks/guard-protected-files.sh`, with the hook's warning reason
4. **Code enforcer findings** — filtered JSON results from Phase 2
5. **Domain checklists applied** — note which checklists were checked:
   - Frontend files (`frontend/app/**`) → `references/frontend-checklist.md`
   - Backend files (`frontend/server/**`) → `references/backend-checklist.md`
6. **Extra user instructions** — any additional instructions from the args

---

## Phase 6: Present Draft Review for Approval (NEVER auto-post)

**You MUST NOT post inline comments, submit a review, or request changes without the user's explicit approval. Always present the draft first and wait for a clear go-ahead.** This applies every time, with no exceptions.

### Step 1 — Show the draft

Print the compiled context as a draft review summary:

1. **PR summary** — number, title, author, size, branch
2. **Phase 3 table** — previous comments and whether they were addressed
3. **Phase 4 table** — PR metadata validation
4. **Protected files touched** — list with hook reasons
5. **Proposed inline comments** — one block per finding: file:line, severity, rule citation, message, suggested fix. Number them so the user can reference individual items.
6. **Proposed review body** — summary text for the top of the review
7. **Proposed review verdict** — COMMENT / APPROVE / REQUEST_CHANGES, with reasoning

### Step 2 — Ask for approval

Use **AskUserQuestion** with options:

- "Post all comments as drafted"
- "Post with changes — I'll tell you which comments to drop or edit"
- "Don't post — just keep the summary here"

Do NOT proceed until the user explicitly picks an option. Treat silence or ambiguous replies as "don't post".

### Step 3 — Only after approval: invoke `/review`

Once the user approves (with or without edits), apply their edits and use the **Skill** tool to invoke `review` with the PR number and compiled context:

```text
<PR number> -- <compiled context from Phase 5, with user's edits applied>
```

If the user said "don't post", stop here — do not invoke `/review` or any PR-mutating `gh` command.

---

## Additional Rules

### PR size check

If `additions > 1000`, include in the review body:

> **Note:** This PR has {additions} additions, which exceeds the recommended 1000-line target per `commit-workflow.md`. Consider splitting into smaller, independently reviewable PRs.

### New contributor awareness

```bash
gh pr list --author <author> --state merged --limit 5 --json number | jq 'length'
```

If the author has fewer than 5 merged PRs to this repo, be more educational in inline comments — explain the **why** behind each rule, not just the **what**.

### Extra instructions

If the user passed extra instructions after the PR number, prioritize those areas but still execute the full review pipeline.
