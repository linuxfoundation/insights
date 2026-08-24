---
description: Enforce ADR structure and conventions on files written under docs/adr/
paths:
  - 'docs/adr/**/*.md'
---

# ADR Format Enforcement

When writing or editing any `.md` file under `docs/adr/`, enforce these rules:

## Exempt files

`README.md` and `template.md` are index/template files — they are **not** ADRs
and are exempt from the section requirements below.

## Required structure for ADR files

Every file matching `docs/adr/[0-9]*.md` **must** have:

1. An H1 heading stating the decision as its title
2. Body prose that covers the context, the decision itself, and the
   alternatives considered with why they were rejected

The body may be short free-form prose (the style most existing ADRs use) or
the full template in [template.md](../../docs/adr/template.md) (Date/Status/Deciders
header block, Context, Decision, Alternatives Considered, Consequences).
The full template is recommended for new ADRs but not required. The
`**Deciders**:` line is always optional.

If the decision, its context, or the rejected alternatives cannot be stated,
**stop and ask the user** for the missing information before writing the file.
Do not write an ADR that records a decision without its reasoning.

## Numbering

- IDs are zero-padded to 4 digits: `0001`, `0002`, `0003`, …
- Assign the next sequential number by scanning existing files with `Glob docs/adr/[0-9]*.md`.
- Never reuse a number, even if a previous ADR is deprecated.

## File naming

`docs/adr/NNNN-kebab-case-title.md` — all lowercase, words separated by hyphens.

## Index maintenance

After writing or changing the status of an ADR, update the index table in
`docs/adr/README.md`:

```markdown
| [ADR-NNNN](./NNNN-kebab-title.md) | Title | accepted | YYYY-MM-DD |
```