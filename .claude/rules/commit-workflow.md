---
description: Commit conventions, branch naming, PR format, PR size guidelines, sign-off + GPG signing, and issue tracking workflow
paths:
  - '*'
---

# Commit & PR Workflow

## Commit Conventions

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format: `type: description`
- A scope is **optional** — most commits in this repo do not use one. When used, it should be lowercase (e.g. `feat(auth): ...`)
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Use present tense, imperative mood: "add feature" not "added feature"
- Keep issue references out of the subject; put them in the commit body (see [Issue Tracking](#issue-tracking))
- Examples:
  - `feat: add PKCE token refresh`
  - `fix: resolve mobile button alignment`
  - `build: upgrade TanStack Query to v5`
  - `chore: update stale dependency versions`

A commit for tracked work carries the issue in its body:

```text
feat: add PKCE token refresh

Refs linuxfoundation/lfx-cdp-insights-ops#123
```

## Commit Signing

All commits must be both DCO-signed and GPG-signed:

- **DCO sign-off (`--signoff`)** — required by repo policy; validated by the Probot DCO check in CI. The `Signed-off-by: Name <email>` trailer is appended automatically when you pass `--signoff` (or `-s`).
- **GPG signature (`-S`)** — required by repo policy. Configure a signing key once:

  ```bash
  git config --global user.signingkey <KEY_ID>
  git config --global commit.gpgsign true
  ```

Standard commit command:

```bash
git commit --signoff -S -m "<type>(<scope>): <subject>" -m "Refs linuxfoundation/lfx-cdp-insights-ops#123"
```

If signing fails, fix the underlying issue — do not push unsigned commits. To verify signature status on a branch's commits:

```bash
git log --format='%G? %h %s' origin/main..HEAD
```

Acceptable `%G?` codes: `G` (good signature) or `U` (good signature, key not in local trust db — fine for policy purposes). Codes `N`, `B`, or `E` need investigation. The authoritative check is GitHub's **Verified** badge after push.

## Branch Naming

- Branch names follow the commit type, then the tracking issue number and a short description
- Format: `type/issue-<issue-number>-short-description`, e.g. `feat/issue-123-token-refresh` or `fix/issue-456-mobile-button`

## PR Titles

- PR titles must follow conventional commit format: `type(scope): description`
- Do not include the issue reference in the title
- Everything should be in lowercase

## PR Size & Focus

- **Target under 1000 lines of diff** — one feature, one bug fix, or one refactor per PR
- **Don't bundle unrelated changes** — keeps reviews focused and rollbacks clean
- Plan PR size upfront; split work into independently reviewable units

## External References

When a PR depends on work in other repos or services, include links in the PR description:

- **API or data changes** — link to the relevant upstream change (e.g., Tinybird endpoint changes)
- **Related PRs** — link any PRs that are part of the same feature effort
- **Deployed dependencies** — if the PR requires another change to be deployed first, call that out explicitly

## Issue Tracking

Work is tracked as GitHub issues in [`linuxfoundation/lfx-cdp-insights-ops`](https://github.com/linuxfoundation/lfx-cdp-insights-ops) (private) and planned on the [LFX CDP and Insights - Main Kanban Board](https://github.com/orgs/linuxfoundation/projects/30).

Before starting any work or commits:

1. **Find the tracking issue** in `linuxfoundation/lfx-cdp-insights-ops`. Do not use closed or stale issues. Older issues keep their legacy Jira key in the title (e.g. `[IN-1234] …`), so search by key.
2. **Create one if the work is untracked** — `gh issue create --repo linuxfoundation/lfx-cdp-insights-ops --template <template>`, or the [new issue](https://github.com/linuxfoundation/lfx-cdp-insights-ops/issues/new/choose) page. Templates set the issue type and add the issue to the board. Set **Team** to `Insights` and set **Priority**; add `needs-triage` if unsure.
3. **Name the branch** `type/issue-<issue-number>-short-description`.
4. **Reference the issue in commit bodies** as `Refs linuxfoundation/lfx-cdp-insights-ops#123`. Always use the fully-qualified path: a bare `#123` resolves against `linuxfoundation/insights`, and `GH-123` does not link.
5. **Link the PR to the issue** in the PR description — `Closes linuxfoundation/lfx-cdp-insights-ops#123` when the PR completes the issue, `Refs linuxfoundation/lfx-cdp-insights-ops#123` when it is one of several PRs.
