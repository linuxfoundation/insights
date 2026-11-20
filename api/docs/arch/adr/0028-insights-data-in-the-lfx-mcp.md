# ADR-0028: In the LFX MCP, Snowflake answers first and Insights shares business rules with the warehouse

**Date**: 2026-11-12
**Status**: accepted
**Deciders**: Insights team, LFX MCP (Pepe Reyero), data lake team (Shane Kalepp)

## Context

The LFX MCP's data tools read the LFX warehouse (Snowflake, built by lf-dbt) through the semantic layer. [ADR-0027](./0027-mcp-calls-insights-api-with-token-exchange.md) adds Insights tools. A parity review of the two sources (lfx-cdp-insights-ops#1010) found many mismatches for the same questions. Most were bugs, and those have been fixed. The rest come from Tinybird and dbt applying different filtering, deduplication and business rules to the same CDP data. The MCP team proposed one source per reader: grow the Insights API until it can replace the warehouse tools (managed foundation collections, CRM accounts, organization filters), or give non-staff users Insights only and swap staff over later.

## Decision

Both sources stay in the MCP, each with its own role:

- **Snowflake** is the source of truth for LF staff and internal questions, including what Insights doesn't model: foundations and the LF project hierarchy, Salesforce, CRM accounts, marketing.
- **Insights** answers Insights questions (collections, Insights metrics such as the health score, projects as shown in Insights). It is also the fallback when Snowflake can't answer. Users who aren't LF staff see Insights only.
- The Insights API doesn't take on warehouse concepts. Concepts that differ on purpose (collections vs foundations, CDP organizations vs Salesforce accounts) stay different, and answers say which one they used.

Where both serve the same data, the business rules are defined once and applied on both sides. This is a joint effort between the Insights team and the data lake team, tracked in a shared comparison of the two rulebooks. Three rules were decided:

1. Disabling a repository in Insights also hides it in Snowflake.
2. Every project counts, whatever its status. Active, Formation and Archived become a filter in the semantic layer. The change is limited to `gold_fact_crowd_dev_activities`, so the LFX One and PCC dashboards are unaffected.
3. Hard deletes in CDP Postgres reach Snowflake.

These rules must match before the Insights tools are turned on in the MCP:

- Activity only counts under the project that owns its repository.
- Deleted repositories are excluded.
- Repositories disabled in Insights are excluded (rule 1).
- Team members and organization accounts are excluded, like bots.
- Every project counts, with status as a filter (rule 2).
- Activity follows a project when its mapping changes (for example a new PCC id), instead of keeping the old one until a full refresh.
- Both sides use the same date windows and week start.
- Software value is computed one way, if the gap is noticeable.

After the data lake team's fixes, the Insights team runs a parity audit. How to catch new drift is decided after the audit.

The Insights API adds what the MCP needs to resolve projects and explain answers:

- `GET /projects` with LFX identifiers
- an `applied` block on widget responses (scope, window, filters)
- `404` with candidate matches for unknown slugs
- later, a daily health snapshot

## Alternatives Considered

### Alternative 1: Grow the Insights API to replace the warehouse tools

- **Pros**: One source per reader, so no contradictory answers.
- **Cons**: Brings the LF hierarchy, managed foundation collections, CRM accounts and organization filters into a product that doesn't use them. Three models to maintain: Snowflake, Insights, and Tinybird copies built for the MCP.
- **Why not**: Most mismatches were bugs or undefined rules, not missing features. Aligning the rules fixes those without moving warehouse concepts into Insights.

### Alternative 2: Insights for non-staff now, swap staff to Insights later

- **Pros**: Ships to non-staff users quickly.
- **Cons**: The later swap needs the same API growth as Alternative 1.
- **Why not**: Same objection. Non-staff still get Insights only under this decision, without a planned swap.

### Alternative 3: Keep both sources without aligning rules

- **Why not**: Staff would get different numbers for the same question from one assistant.

## Consequences

### Positive

- Each product keeps its own concepts, and shared data follows one definition.
- Fixing the shared rules also corrects every other warehouse consumer.

### Negative

- Launch depends on dbt changes owned by another team.
- Rules can drift again when either side changes. A safeguard is still to be agreed after the audit.

### Ownership

- **Insights team**: the Insights API changes above, the Tinybird-side fixes, and the parity audit.
- **Data lake team**: the dbt changes, tracked as DL tickets.
- **LFX MCP (Pepe Reyero)**: routing between the two sources in the tool descriptions and guidance.
