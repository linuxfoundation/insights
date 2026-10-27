# Knowledge notes

Short, typed notes that describe how Insights is built, for agents and for people new to the
code. Start from the repository's `AGENTS.md`; these notes go one level deeper.

| Note                                               | What it covers                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| [`sys-insights.md`](sys-insights.md)               | What each part of the repository does, where it runs and what data it reads |
| [`cross-repo-contract.md`](cross-repo-contract.md) | Everything Insights shares with CDP, and what breaks it                     |
| [`local-setup.md`](local-setup.md)                 | Where the setup guides are, and the parts that involve CDP                  |

CDP's own notes, covering its services, how activity data reaches Tinybird and its member identity
model, are in `docs/knowledge/` in the crowd.dev repository.

## Conventions

Each note starts with frontmatter:

```yaml
---
type: system | data-flow | data-model | runbook | contract
slug: sys-insights
name: Human-readable title
repo: insights
owner: Insights team
depends_on: [slugs of notes or systems this relies on]
used_by: [slugs of notes or systems that rely on this]
sources: [code paths this note is grounded in]
---
```

The slugs follow the prefixes used by the LFX knowledge graph (`sys-`, `proj-`, `dec-` and so
on), so these notes can move into it without renaming.

Notes are maps, not manuals. Where a deeper document already exists, a note links to it rather
than repeating it. When code changes make a note wrong, fix the note in the same pull request.
