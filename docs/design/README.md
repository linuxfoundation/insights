# Design proposals

Proposals for work that is not built yet, written to be reviewed before implementation. They
complement the other two kinds of documentation in this repository:

| Where                                            | What it holds                                                |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `docs/design/`                                   | Proposals: options, trade-offs and open questions            |
| [`api/docs/arch/adr/`](../../api/docs/arch/adr/) | Accepted decisions, one per record                           |
| [`docs/knowledge/`](../knowledge/README.md)      | How Insights is built today, for agents and people new to it |

| Proposal                                           | What it covers                                                                                  | Status   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| [`lfx-mcp-integration.md`](lfx-mcp-integration.md) | Exposing the Insights Public API through the LFX MCP: authentication and per-user rate limiting | proposal |

## Conventions

- One file per proposal, named in kebab case after the subject.
- Each proposal starts with **Status** (`proposal`, `accepted`, `superseded`), **Date** and
  **Author**, and links the ADRs and repositories it touches.
- A proposal can span several systems or repositories. It describes the design and the decisions
  it needs, not a line-by-line implementation plan.
- Once accepted, the decisions it makes are recorded as ADRs (`/adr`), the proposal's status is
  set to `accepted` with links to them, and the knowledge notes are updated when the work ships.
