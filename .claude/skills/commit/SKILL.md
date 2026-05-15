---
name: commit
description: Generate a commit message and commit staged changes using git commit -s -S.
allowed-tools: Bash, AskUserQuestion
---

Commit the current staged changes.

1. Run `git diff --staged`. If empty, tell the user there is nothing staged and stop.
2. Run `git log --oneline -5` to understand this repo's commit message style and conventions.
3. Run `git branch --show-current` to get the branch name. If it contains an `IN-XXX` ticket number, include it inline at the end of the subject (e.g. `feat: add token refresh IN-123`).
4. Generate a single commit message following Conventional Commits format: `type: description`. Subject max 72 characters. No scope required. No body, no trailers, no Co-Authored-By.
5. Run `git commit -s -S -m "<message>"` using exactly the generated message.
6. Output only the commit hash and subject line from the result.
