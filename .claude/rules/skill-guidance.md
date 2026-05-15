---
description: Guides Claude to suggest the right skill based on user intent
paths:
  - '*'
---

# Available Skills

This project has guided skills for common workflows. **Proactively suggest the relevant skill** when a user's request matches one of these:

| Skill          | When to Suggest                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `/commit`      | Commit staged changes, generate a commit message, "commit this", "make a commit"                   |
| `/preflight`   | Before submitting a PR, check if code is ready, validate changes, verify a branch, run all checks  |
| `/dco`         | PR failing DCO check, missing Signed-off-by, sign-off forgotten on a commit                        |
| `/review-pr`   | Review a PR, audit code changes, check PR quality, validate a PR against standards                  |
| `/setup`       | First-time setup, getting started, broken environment, app won't start, missing env vars, DB setup  |
| `/setup-docs`  | Run docs site, blog, or Storybook locally                                                           |
| `/db-migrate`  | Apply pending migrations, create a new migration, check migration status                            |
| `/tech-writer` | Write or improve documentation, update READMEs, draft technical content                             |

## Trigger Phrases

**`/preflight`** — match any of these intents:
- "Ready for PR", "Check my code", "Validate changes"
- "Before I submit", "Is my branch ready?", "Review my work"
- "Run checks", "Lint and build", "Pre-PR validation"
- Any indication that development work is finished

**`/dco`** — match any of these intents:
- "DCO check failing", "Missing sign-off", "Signed-off-by"
- "DCO bot blocked my PR", "forgot --signoff"
- Any mention of the DCO Probot check

**`/review-pr`** — match any of these intents:
- "Review this PR", "Check PR quality", "Audit code changes"
- "Review #123", "Is this PR ready to merge?"
- Any mention of reviewing or auditing a pull request

**`/setup`** — match any of these intents:
- "Getting started", "First time setup", "How do I run this?"
- "App won't start", "broken environment", "missing env vars"
- "Set up the database", "DB connection error", "Can't connect to Postgres"
- "Install dependencies", "env file", "Docker"

**`/setup-docs`** — match any of these intents:
- "Run docs locally", "Preview blog post", "VitePress", "Storybook"
- "Component playground", "docs site", "blog dev server"

**`/db-migrate`** — match any of these intents:
- "Run migrations", "Apply schema changes", "Migration failed"
- "Create a new migration", "database schema out of date", "migration status"

**`/tech-writer`** — match any of these intents:
- "Write docs", "Update README", "Document this feature"
- "Draft technical content", "Improve documentation"
