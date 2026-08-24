---
description: Commit conventions, branch naming, PR format, PR size guidelines, sign-off + GPG signing, and JIRA tracking workflow
paths:
  - '*'
---

# Commit & PR Workflow

## Commit Conventions

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format: `type: description`
- A scope is **optional** — most commits in this repo do not use one. When used, it should be lowercase (e.g. `feat(auth): ...`)
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Use present tense, imperative mood: "add feature" not "added feature"
- Include the JIRA ticket **inline in the description**, not as a scope
- Examples:
  - `feat: add PKCE token refresh IN-123`
  - `fix: resolve mobile button alignment`
  - `build: upgrade TanStack Query to v5`
  - `chore: update stale dependency versions`

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
git commit --signoff -S -m "<type>(<scope>): <subject>"
```

If signing fails, fix the underlying issue — do not push unsigned commits. To verify signature status on a branch's commits:

```bash
git log --format='%G? %h %s' origin/main..HEAD
```

Acceptable `%G?` codes: `G` (good signature) or `U` (good signature, key not in local trust db — fine for policy purposes). Codes `N`, `B`, or `E` need investigation. The authoritative check is GitHub's **Verified** badge after push.

## Branch Naming

- Branch names follow commit types followed by the JIRA ticket number
- Format: `feat/IN-123` or `fix/IN-456`

## PR Titles

- PR titles must follow conventional commit format: `type(scope): description`
- Do not include the JIRA ticket in the title
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

## JIRA Tracking

Before starting any work or commits:

1. **Check if there is a JIRA ticket** — always track work in the `IN` project
2. **Create a JIRA ticket if needed** for untracked work
3. **Include JIRA ticket in commit message** (e.g., `IN-XXX`)
4. **Link PR to JIRA ticket** when creating pull requests
