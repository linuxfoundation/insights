# Design docs

Major architecture diagrams for Insights: how services, stores and repositories connect. Start from
the repository's `AGENTS.md` and the notes in [`docs/knowledge/`](../knowledge/README.md); these
docs show the picture behind them.

| Doc                                                          | What it shows                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`caching.md`](caching.md)                                   | The caches between visitors and Tinybird, how a request passes through them, and what clears them     |
| [`insights-mcp-integration.md`](insights-mcp-integration.md) | _Planned._ How the LFX MCP reaches the Insights Public API as the user, and which source answers what |

## Where a doc goes

Product documentation in this repository has three homes. Each answers a different question and
changes at a different rate, so each lives on its own.

| Folder               | Answers                                      | Changes when                           |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| `docs/knowledge/`    | Where is X, and what touches it?             | The code paths it lists change         |
| `docs/design/`       | How do the parts of the system fit together? | The architecture changes               |
| `api/docs/arch/adr/` | Why is it this way?                          | Never; a new ADR supersedes an old one |

- **Knowledge and design are apart** because notes change whenever a file moves, while
  architecture changes rarely, and because one diagram serves several notes. Kept here, a
  diagram exists once and each note links to it.
- **Design and ADRs are apart** because a design doc is kept true as the system changes, while an
  ADR records a decision at a point in time and is never rewritten.

To decide where something goes:

1. A picture of how services, stores or repositories connect → `docs/design/`
2. The reason behind a choice, with the alternatives → `api/docs/arch/adr/`
3. The internals of one service or library, the rules and algorithms it runs, or how to run it →
   that service's or library's `README.md`
4. Anything else: what exists, where to look, what depends on what → `docs/knowledge/`

## Conventions

- **Major architecture only.** A design doc shows how components connect: component maps, data
  flows, sequences between services, and the data model they share. It covers something that
  spans services, stores or repositories.
- **Rules stay next to the code.** Decision rules, scoring and algorithms go in the README of the
  service or library that runs them, even when drawn as a flowchart, and the design doc links
  there. So does a diagram of one service's or library's internals.
- **Current state only.** Proposals and alternatives belong in ADRs. One exception: once its ADRs
  are accepted, a design that is being built can be documented here, marked **Planned** at the top
  and linked to those ADRs. It describes the chosen design only, and becomes current state as the
  work ships.
- **Diagrams are Mermaid**, so they render on GitHub and diff in review. Use an image only when
  Mermaid can't draw it: keep it under about 300 KB in `docs/design/assets/`, with its editable
  source (`.excalidraw`, `.drawio`) next to it.
- **Notes link to design docs**, and notes don't draw their own diagrams of the system.
- Each doc starts with the same frontmatter as the knowledge notes, with `type: design` and a
  `design-` slug:

```yaml
---
type: design
slug: design-caching
name: Human-readable title
repo: insights
owner: Insights team
depends_on: [slugs of notes or systems this relies on]
used_by: [slugs of notes that link here]
sources: [code paths the diagrams are grounded in]
---
```

When code changes make a diagram wrong, fix it in the same pull request.
`.claude/hooks/knowledge-doc-check.sh` reminds Claude Code when it edits a file that a design doc
lists under `sources`; a source ending in `/` covers everything below it.

Architecture decisions for Insights are in `api/docs/arch/adr/`. CDP's design docs, including the
activity pipeline that feeds Tinybird, are in `docs/design/` in the crowd.dev repository.
