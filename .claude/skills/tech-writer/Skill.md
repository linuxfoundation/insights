# Tech Writer

Write public-facing documentation for new features, improvements, or changes in LFX Insights.

## When to Use

Invoke `/tech-writer` when:
- A new feature has been built and needs a doc page
- An existing feature has changed and its doc needs updating
- A new metric, concept, or configuration option needs to be explained publicly
- The user says "write docs for X", "document this feature", "update the docs"

## Docs Site Overview

- **Location:** `frontend/docs/`
- **Framework:** VitePress (Markdown → static site)
- **Live URL:** `https://insights.linuxfoundation.org/docs/`
- **Local preview:** `cd frontend && pnpm docs:dev` → `http://localhost:5173`
- **Sidebar config:** `frontend/docs/.vitepress/config.ts` — every new page must be added here

### Sidebar Sections

| Section | Folder | Purpose |
|---|---|---|
| Introduction | `docs/introduction/` | What Insights is, data sources, contributions, maintainers |
| Metrics | `docs/metrics/` | Health score, contributors, popularity, development, security |
| Features | `docs/features/` | User-facing product features (Copilot, repo groups, collections) |
| More | `docs/more/` | FAQ, glossary |

**Rule:** New feature docs go in `docs/features/`. New metric docs go in `docs/metrics/`. Clarifications or concept docs go in `docs/introduction/`.

## File Structure

Each doc lives in its own folder as `index.md`:

```
frontend/docs/features/my-new-feature/index.md
```

Images go in:
```
frontend/docs/images/my-new-feature-screenshot.png
```

Reference images with relative paths:
```markdown
![Alt text](../../images/my-new-feature-screenshot.png)
```

## Markdown Conventions

**No frontmatter** — docs pages start directly with the `#` heading (unlike blog posts which use YAML frontmatter).

**Heading hierarchy:**
```markdown
# Feature Name          ← page title, used in sidebar if not overridden
## Overview             ← first section, always present
## How It Works         ← or "Using X", "Key Concepts", etc.
## Example              ← include screenshots when possible
## Configuration        ← if applicable
## FAQ                  ← if applicable
```

**VitePress callout blocks:**
```markdown
::: warning ⚠️ Heads up
Something the user should be aware of.
:::

::: info
Neutral informational note.
:::

::: tip
Helpful suggestion or shortcut.
:::
```

**Links — always use relative paths within docs:**
```markdown
[Health Score](../../metrics/health-score/index.md)
[Data Sources](../../introduction/data-sources/index.md)
```

**Tables:**
```markdown
| Column A | Column B |
|---|---|
| Value    | Value    |
```

**Images:**
```markdown
![Descriptive alt text](../../images/feature-name.png)
```

## Writing Style

- **Audience:** open source maintainers, contributors, and project leads — technically literate but not necessarily engineers
- **Tone:** clear, direct, informative — not marketing-heavy
- **Perspective:** second person ("you can", "your project") for instructions; third person for concept explanations
- **Length:** as long as needed, no padding — each section should earn its place
- **No jargon** without a definition or link to the glossary

**Avoid:**
- "Simply", "easily", "just" — don't minimize complexity
- Passive voice where active is clearer
- Repeating the page title verbatim in the first sentence

## Workflow

When `/tech-writer` is invoked, follow these steps:

### Step 1 — Understand the feature

Before writing anything:
1. Ask the user: *"What is the feature? What does it do for the end user?"* if not already described
2. Read relevant source files to understand the implementation — check `frontend/app/pages/`, `frontend/app/components/modules/`, and `frontend/server/api/`
3. Check if a doc already exists in `frontend/docs/` for this topic — if so, update rather than create

### Step 2 — Decide placement

Based on what the feature is:
- **New product feature** (UI, workflow, user action) → `docs/features/<slug>/index.md`
- **New metric or data point** → `docs/metrics/<slug>/index.md`
- **Concept, term, or data explanation** → `docs/introduction/<slug>/index.md` or add to `docs/more/glossary/index.md`
- **Update to existing page** → edit the existing file

### Step 3 — Draft the doc

Use the structure:
```markdown
# <Feature Name>

## Overview

<2–4 sentence description of what this feature is and why it matters to the user.>

## <Core Section>

<Explain how it works, what the user sees, what actions they can take.>

## Example

<Screenshot or walkthrough. If no screenshot is available yet, add a placeholder note.>

## <Additional Sections as needed>
```

### Step 4 — Update the sidebar

After creating a new file, add it to the sidebar in `frontend/docs/.vitepress/config.ts`:

```ts
// In the correct section:
{ text: 'My New Feature', link: '/features/my-new-feature/index.md' },
```

Match the casing and style of surrounding entries.

### Step 5 — Confirm with user

Present the draft and ask:
- Does the description match how you'd explain this to a user?
- Are there screenshots you want to include?
- Should this link to or from any other doc page?

## Example Invocations

```
/tech-writer The team just shipped "Saved Filters" — users can now bookmark their current filter state and share it via URL. Write the docs.

/tech-writer Update the Repository Groups doc to mention the new self-service request form we added.

/tech-writer We added a new "Community Voice" tab to project pages that shows sentiment from GitHub Discussions. Document it.
```
