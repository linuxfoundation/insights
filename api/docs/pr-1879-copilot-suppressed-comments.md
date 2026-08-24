# PR #1879 — Suppressed Review Comments by Copilot (copilot-pull-request-reviewer)

PR: [docs: add public API architecture plan and ADRs](https://github.com/linuxfoundation/insights/pull/1879)

Source: the latest Copilot review posted 2026-08-12 hides 51 low-confidence comments in a collapsed "Suppressed comments" block. Suppressed comments have no per-item discussion threads, so every item below links to the review itself: https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530

The 51 comments collapse into **26 distinct issues** (19 of them are the same ADR-template complaint repeated per file, and several others are duplicated across PLAN/ADR copies). Assessed on 2026-08-12 against the current branch state: **24 valid, 1 partially valid, 1 largely invalid**. Despite being "low confidence" for Copilot, this batch is higher quality than expected. It caught broken anchors, dangling task IDs, and two genuine design gaps.

---

## A. Broken links and dangling task references (mechanical fixes)

## 1. Epic anchor links use a double hyphen and don't resolve

- **Files:** `docs/PUBLIC_API_PLAN.md` (many links, e.g. lines 286, 338, 340, 343, 352, 353), `docs/architecture-review/01-overview.md:132`, `docs/adr/0003-tolerant-reader-versioning.md:20` (3 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Links like `#epic-e16--pre-launch` use two hyphens after the epic number, but headings like `### Epic E16: Pre-Launch` generate single-hyphen anchors (`#epic-e16-pre-launch`). The colon is dropped, not replaced. Every epic anchor in the PLAN, plus the cross-file links from 01-overview and ADR-0003, is broken.
- **Verdict:** ✅ Valid. Verified against the current headings; none of the double-hyphen links resolve.
- **Suggested fix:** Global replace `#epic-eN--` with `#epic-eN-` (and `--` between words where the source heading had a colon or ampersand) across the three files. Spot-check each link against the actual generated anchor afterwards.
- **Status:** ✅ Fixed in docs (2026-08-12). The hyphen after the epic number is now single everywhere. Note: interior double hyphens like `foundation--framework` and `security--best-practices` are correct and kept, since GitHub turns ` & `/` + ` into two hyphens.

## 2. D5 decision-summary link in 02-decisions.md is broken

- **File:** `docs/architecture-review/02-decisions.md:116`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The link targets `#d5-datadog-metrics-strategy--custom-metrics-vs-apm-trace-metrics` (double hyphen), but the heading `### D5. Datadog Metrics Strategy: Custom Metrics vs APM Trace Metrics` generates the single-hyphen anchor.
- **Verdict:** ✅ Valid. Same root cause as #1.
- **Suggested fix:** Change the anchor to `#d5-datadog-metrics-strategy-custom-metrics-vs-apm-trace-metrics`.
- **Status:** ✅ Fixed in docs (2026-08-12).

## 3. T-089 is referenced but never defined

- **File:** `docs/PUBLIC_API_PLAN.md:286` (T-096 depends on `[T-089]`)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** T-096 (closed-alpha "request access" state) points at T-089 for the allowlist, but no T-089 exists anywhere in the plan. Epic E16 only defines T-090 and T-091.
- **Verdict:** ✅ Valid. Verified: zero definitions of T-089 in the docs.
- **Suggested fix:** Either add a T-089 task defining the closed-alpha allowlist in Epic E16, or repoint the T-096 dependency to the task that actually owns the allowlist.
- **Status:** ✅ Fixed in docs (2026-08-12). T-089 is now defined in Epic E16 as the closed-alpha org allowlist task.

## 4. T-093 is referenced but never defined

- **Files:** `docs/PUBLIC_API_PLAN.md:394`, `docs/CONTEXT.md:34` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Both files say tier hierarchy and rate-limit numbers are "confirmed at T-093", but T-093 is defined nowhere. The actual tier/rate-limit product-signoff task is T-091.
- **Verdict:** ✅ Valid. Verified: T-093 has references but no definition.
- **Suggested fix:** Replace both T-093 references with T-091, or define T-093 in Epic E16 if the signoff is meant to be a separate task.
- **Status:** ✅ Fixed in docs (2026-08-12). Both references now point at T-091.

## 5. The "Security review" promotion criterion cites T-091, which is tier mapping

- **File:** `docs/PUBLIC_API_PLAN.md:353`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** §8 Verification lists "Security review ([T-091])", but T-091 is defined at line 293 as tier-to-API-access mapping with product. No security-review task exists, so the promotion gate is untraceable.
- **Verdict:** ✅ Valid. Verified against the T-091 definition.
- **Suggested fix:** Add a dedicated security-review task to Epic E16 (e.g. T-092) and reference it at line 353. Leave T-091 as the tier-mapping task.
- **Status:** ✅ Fixed in docs (2026-08-12). T-092 (security review of the auth chain and API surface) added to Epic E16; the §8 Verification criterion now cites T-092.

---

## B. Real design gaps

## 6. Scalar's browser "try it" client bypasses the ADR-0004 CORS boundary

- **Files:** `docs/PUBLIC_API_PLAN.md:127`, `docs/adr/0016-vitepress-scalar-api-docs.md:9` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Docs are served at `api.insights.linuxfoundation.org/docs`, the same origin as `/v1`. CORS never applies to same-origin requests, so Scalar's built-in browser client can call the API even though ADR-0004 makes v1 intentionally unusable from browser JavaScript. It also invites users to paste long-lived PATs into a browser UI. Neither ADR-0016 nor ADR-0004 mentions this.
- **Verdict:** ✅ Valid. Genuine unaddressed design gap. The two ADRs currently contradict each other in effect.
- **Suggested fix:** Let's go with disabling Scalar's try-it client for v1.(docs render the reference only). Cross-reference the decision from ADR-0004.
- **Status:** ✅ Fixed in docs (2026-08-12). ADR-0016 now states the try-it client is disabled in v1 with the same-origin rationale, plus a Consequences guard against re-enabling it. ADR-0004 gained a caveat noting CORS doesn't cover the same-origin docs and pointing at ADR-0016. The PLAN D2 decision paragraph carries the same note.

## 7. Health probes and docs routes have no auth exception under ADR-0009

- **Files:** `docs/PUBLIC_API_PLAN.md:177`, `docs/adr/0009-api-key-required-for-all-requests.md:3` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** ADR-0009 says every request requires a valid API key with no anonymous path, but T-006 defines `/health/live` and `/health/ready`, and T-030 serves `/docs` and the OpenAPI artifact. Kubernetes probes and public docs can't carry a customer PAT. As written, a global auth hook would fail probes and lock the docs.
- **Verdict:** ✅ Valid. No exception is documented anywhere.
- **Suggested fix:** Add an explicit scope note to ADR-0009: the key requirement applies to customer data routes (`/v1*`, `/v1-alpha*`); `/health/*`, `/docs`, and `/v1/openapi.json` are exempt, with `/health/*` restricted at the network layer.
- **Status:** ✅ Fixed in docs (2026-08-12). ADR-0009 gained a Scope section: key requirement covers `/v1/...` and `/v1-alpha/...`; `/health/*` (network-restricted probes), `/docs`, and `/v1/openapi.json` are exempt, and the auth hook is scoped to the versioned routes rather than global. T-006 in the PLAN now points at that section.

## 8. Tinybird failure policy cites the wrong ADR and contradicts CONTEXT.md

- **File:** `docs/PUBLIC_API_PLAN.md:404`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Line 404 says "Tinybird errors: serve stale Redis cache, 503 if no cache. (ADR-0016)". ADR-0016 is the VitePress/Scalar docs decision. No ADR covers Tinybird failure policy. The line also says stale (expired) data is served, while CONTEXT.md:101 says expired cache yields 503 and only entries within their normal TTL are served.
- **Verdict:** ✅ Valid. Wrong citation and a real behavioral conflict (serve-stale vs 503-on-expired changes implementation).
- **Suggested fix:** Align line 404 with CONTEXT.md ("cached response served if within TTL, otherwise 503 `upstream_unavailable`") and drop the ADR-0016 citation. Optionally record the failure policy as its own short ADR.
- **Status:** ✅ Fixed in docs (2026-08-12). The PLAN line now matches CONTEXT.md exactly (cache served only within its normal TTL, otherwise 503 `upstream_unavailable`) and cites the CONTEXT.md convention instead of ADR-0016. No dedicated ADR written; can be added later if the policy needs alternatives recorded.

---

## C. Cross-document contradictions

## 9. §9 calls 4b "planned" and gives the final call to DevOps, contradicting ADR-0006 and T-015

- **File:** `docs/PUBLIC_API_PLAN.md:395`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** §9 Open Questions #3 says "4b (planned)... Final call sits with DevOps." ADR-0006 calls 4b "the suggested direction" and says the Insights team stewards the call with DevOps input, which T-015 (line 196) repeats.
- **Verdict:** ✅ Valid. Ownership and status must read the same everywhere.
- **Suggested fix:** Reword line 395 to "4b (suggested direction, per ADR-0006)... Insights stewards this call, with DevOps input."
- **Status:** ✅ Fixed in docs (2026-08-12). §9 open question #2 now says "4b (suggested direction, per ADR-0006)" and "Insights stewards the call, with DevOps input; confirmed at T-015", matching ADR-0006, T-015, and 01-overview.

## 10. ADR-0006's Decision commits to 4b while its Variants section keeps both open

- **File:** `docs/adr/0006-pat-token-exchange-for-api-credentials.md:15` (Decision) vs lines 31-33 (Variants)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The Decision states org/tier are passed as trusted headers "(variant 4b)", but "Variants under consideration" says both variants of option 4 remain on the table. An implementer can't tell if 4b is decided or provisional.
- **Verdict:** ✅ Valid. Internal contradiction in an accepted ADR.
- **Suggested fix:** Reword the Decision to "variant 4b, the suggested direction; confirmed at T-015" so the Decision and Variants sections agree, or move the 4a fallback into Alternatives Considered if 4b is final.
- **Status:** ✅ Fixed in docs (2026-08-12). The Decision now reads "(variant 4b, the suggested direction; 4a remains viable and the choice is confirmed at T-015, see Variants below)", so the Variants section elaborates the Decision instead of contradicting it.

## 11. The top rollout summary omits Overviews and Leaderboard

- **File:** `docs/PUBLIC_API_PLAN.md:21`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Line 21 lists five groups ending "Security & Best Practices → Collections (more later)", but §5 (lines 297-306) defines seven: Development, Contributors, Popularity, Security & Best Practices, Overviews, Collections, Leaderboard.
- **Verdict:** ✅ Valid.
- **Suggested fix:** Expand line 21 to the full seven-group order from §5.
- **Status:** ✅ Fixed in docs (2026-08-12). The Goals rollout line now lists all seven groups in §5 order.

## 12. The Endpoint Group glossary entries list five of seven groups

- **Files:** `docs/CONTEXT.md:40`, `docs/architecture-review/03-context.md:44` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Both canonical glossary definitions say "(Development, Contributors, Popularity, Security, Collections)", omitting Overviews and Leaderboard. Tasks and generated docs inherit this taxonomy.
- **Verdict:** ✅ Valid. Same root cause as #11 in the canonical-language files.
- **Suggested fix:** List all seven groups in both glossary entries.
- **Status:** ✅ Fixed in docs (2026-08-12). Both entries now list all seven groups with "Security & Best Practices" spelled out.

## 13. §7 groups Overviews with the Collections permission check

- **File:** `docs/PUBLIC_API_PLAN.md:375`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The heading "Phase 5 (Overviews) + Phase 6 (Collections):" introduces the tier/permission-check text, implying Overviews may need it. ADR-0007 and 02-decisions.md:55-58 make Groups 1-5 public-data-only, with the ownership check restricted to Group 6.
- **Verdict:** ✅ Valid. The check text itself is Collections-only, but the shared heading blurs the authorization boundary.
- **Suggested fix:** Split the item: Phase 5 (Overviews) is public-data-only like Groups 1-4; Phase 6 (Collections) carries the ADR-0007 permission check.
- **Status:** ✅ Fixed in docs (2026-08-12). Data-scope bullets now read "Phases 1–5 (... Overviews): public OSS data, no per-project permission check" and "Phase 6 (Collections): adds a tier check + permission check", matching ADR-0007 and 02-decisions.

## 14. Decision #18 says "~5–60s TTL", contradicting the 24h/1h cache contract

- **File:** `docs/PUBLIC_API_PLAN.md:383`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** §9 decision 18 states an origin Redis cache with "~5–60s TTL depending on endpoint", while §2 (line 103), CONTEXT.md:100, and ADR-0013 all commit to 24h for stable data and 1h for time-series. A 60-second cache would invalidate the documented capacity assumptions.
- **Verdict:** ✅ Valid. Direct numeric contradiction.
- **Suggested fix:** Change line 383 to "24h TTL for stable data, 1h for time-series analytics, per ADR-0013".
- **Status:** ✅ Fixed in docs (2026-08-12). Decision 18 now cites the ADR-0013 two-tier model (24h stable, 1h time-series); the 5–60s leftover is gone.

## 15. ADR-0011 says cursor encoding can change without a breaking change

- **File:** `docs/adr/0011-pagination-cursor-based.md:23`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The Cursor encoding section says opacity lets the server "change the internal encoding (add fields, switch format) without issuing a breaking change", while CONTEXT.md:44 and PUBLIC_API_PLAN.md:382 explicitly classify changing cursor encoding semantics as breaking. Also, even with opaque cursors the server must keep accepting outstanding v1 cursors across any format change.
- **Verdict:** ✅ Valid. The two statements are reconcilable (internal format vs observable semantics) but the ADR doesn't draw that line.
- **Suggested fix:** Reword ADR-0011: internal format changes are non-breaking only if outstanding cursors keep working during a transition window; changing the observable cursor semantics is a breaking change per ADR-0003.
- **Status:** ⏭️ Skipped (2026-08-12, reviewed and left as-is by decision).

## 16. Single `api/openapi.json` vs per-version `/v1/openapi.json` artifact

- **Files:** `docs/PUBLIC_API_PLAN.md:223` (T-030), `docs/adr/0016-vitepress-scalar-api-docs.md:9,14` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** T-030 and ADR-0016 have Scalar ingest a single `api/openapi.json`, while T-037 (line 235) requires one spec per version served at `/v1/openapi.json`. Scalar could ingest a different spec than the API exposes.
- **Verdict:** ✅ Valid. The artifact naming needs one version-aware scheme.
- **Suggested fix:** Standardize on per-version artifacts (`/v1/openapi.json`) and update T-030 and ADR-0016 so Scalar reads the versioned spec for the version being documented.
- **Status:** ✅ Fixed in docs (2026-08-12). T-030 and both ADR-0016 mentions now reference the per-version spec served at `/v1/openapi.json` (one per major version, per T-037); `api/openapi.json` no longer appears anywhere.

## 17. PLAN says docs get "their own subdomain"; everything else says `/docs` on the API host

- **File:** `docs/PUBLIC_API_PLAN.md:131`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Line 131 ends "Deployed independently of the frontend with its own subdomain", but ADR-0016, T-030, and 01-overview.md:39 all serve docs at `api.insights.linuxfoundation.org/docs` via Fastify. The topology choice also decides item #6 (same-origin Scalar client).
- **Verdict:** ✅ Valid.
- **Suggested fix:** Change line 131 to "served at `/docs` on the API host, per ADR-0016". Resolve together with #6 since a separate origin would restore the CORS boundary.
- **Status:** ✅ Fixed in docs (2026-08-17). D2 decision paragraph now ends "Deployed independently of the frontend, served at `/docs` on the API host (per ADR-0016)." Consistent with ADR-0016, T-030, 01-overview, and the #6 same-origin rationale.

## 18. Glossaries call the User the "billing principal"

- **Files:** `docs/CONTEXT.md:26`, `docs/architecture-review/03-context.md:28` (2 suppressed comments)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Both User glossary entries say the User "is the billing principal", but ADR-0010 and PLAN §9 decision 14 say access is bundled with the org's LFX membership and usage is never invoiced. The Organization holds the paid tier; the User has no billing relationship.
- **Verdict:** ✅ Valid. Misleading for downstream authorization/telemetry design.
- **Suggested fix:** Drop "and is the billing principal" from both entries (the User is the identity principal via `sub`; the Organization holds the membership).
- **Status:** ✅ Fixed in docs (2026-08-17). Both entries now read "The human account that owns one or more API Keys (PATs). Identified by the JWT `sub` claim."

## 19. The Goals line says "bill by tier", which v1 explicitly won't do

- **File:** `docs/PUBLIC_API_PLAN.md:20`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** "Heavy observability (OTel → Datadog) so we can offer SLAs and bill by tier confidently" conflicts with §9 decision 14 and ADR-0010: bundled membership, usage metered only for rate limits and dashboards, not for invoicing.
- **Verdict:** ✅ Valid.
- **Suggested fix:** Reword to "offer SLAs and enforce tier-based rate limits confidently".
- **Status:** ✅ Fixed in docs (2026-08-17). Line 20 now reads "offer SLAs and enforce tier-based rate limits confidently", matching ADR-0010 and §9 decision 14.

## 20. Epics E7-E13 are named "Endpoint Migration Phase N", but the glossary bans "phase"

- **File:** `docs/PUBLIC_API_PLAN.md:239` (and E8-E13 headings)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** CONTEXT.md:106 resolves "phase" as informal and to be avoided in task descriptions, yet all seven migration epics are titled "Endpoint Migration Phase N". These names become Jira epics.
- **Verdict:** ✅ Valid. The PR's own canonical language contradicts its epic names.
- **Suggested fix:** Rename to "Endpoint Migration Group N: <Name>" (and update the anchors that point at them, together with item #1).
- **Status:** ⏭️ Skipped (2026-08-17, reviewed and left as-is by decision). Epic names keep "Phase N".

## 21. A decided item sits in the "Open Questions" table

- **File:** `docs/architecture-review/01-overview.md:180`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The Open Questions intro says every item is unresolved, but row 2 (multi-org Key Contact resolution) is explicitly marked "(decided, 2026-05-19 review call + 2026-08-10)".
- **Verdict:** ✅ Valid. Reviewers will treat a settled decision as pending input.
- **Suggested fix:** Move the row to a short "Resolved" list under the table, or soften the section intro to "unresolved unless marked decided".
- **Status:** ✅ Fixed in docs (2026-08-17). Removed the decided row from the table entirely (per decision); remaining rows renumbered 1–2. The decision itself remains documented in CONTEXT.md:82, PLAN T-015, and PLAN §9 decision 10.

---

## D. Factual and minor issues

## 22. Express 5 is called "imminent for years" but shipped stable in 2024

- **File:** `docs/PUBLIC_API_PLAN.md:117`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The framework comparison table's Express row says "Express 5 has been 'imminent' for years". Express 5 went stable in September 2024 and improved async error propagation, so two of the listed cons are stale.
- **Verdict:** ✅ Valid. Doesn't change the Fastify decision (throughput, validation, and OpenAPI arguments stand), but the row is factually out of date.
- **Suggested fix:** Update the row to acknowledge Express 5 is released and rest the rejection on the still-true cons (no built-in validation/OpenAPI, lower throughput, no opinionated structure).
- **Status:** ✅ Fixed in docs (2026-08-17). Cons cell now notes Express 5 shipped in 2024 and fixes async error handling; rejection rests on no validation/OpenAPI, throughput, and lack of structure.

## 23. The pnpm-workspace.yaml inventory in T-001's note is wrong

- **File:** `docs/PUBLIC_API_PLAN.md:344`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The plan says the workspace "currently lists `frontend`, `workers/*`", but the real file also lists the crowd.dev submodule libs/archetypes, `workers`, `workers/temporal/*`, and `services`.
- **Verdict:** ✅ Valid. Trivial, but an implementer editing the file from this description would be surprised.
- **Suggested fix:** Either enumerate the actual entries or just say "add `api` (and `libs/*` if shared libs are extracted) to the existing workspace list".
- **Status:** ⏭️ Skipped (2026-08-17, reviewed and left as-is by decision).

## 24. Datadog claim: span-based metrics bill as custom metrics

- **File:** `docs/PUBLIC_API_PLAN.md:157` (D5 table)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** Copilot says the plan conflates querying retained spans with generating span-based metrics, and that per-customer grouping recreates the custom-metric cardinality cost.
- **Verdict:** ⚠️ Partially valid. The docs do **not** conflate the two: D5 and §6 explicitly keep `enduser.id`/`api_key_id` on spans and off custom metrics. The residual truth in the comment: Datadog bills metrics **generated from spans** as custom metrics, so the "no cost spike" claim holds for Trace Explorer / dashboard queries over indexed spans, not for span-derived monitors or timeseries. Indexed-span retention also has its own cost.
- **Suggested fix:** Optional hardening. Add one caveat to D5: per-customer views are Trace Explorer / indexed-span queries; generating persistent metrics from spans would bill as custom metrics and stays out of scope.
- **Status:** ⏭️ Skipped (2026-08-17, reviewed and left as-is by decision). Docs already keep high-cardinality tags off custom metrics; caveat judged unnecessary.

---

## E. ADR process (19 comments, one theme)

## 25. 18 of 19 ADRs don't follow the repo's mandatory ADR template

- **Files:** every `docs/adr/00NN-*.md` except 0006 (18 suppressed comments, one per file)
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** `.claude/rules/adr-format.md` mandates `# ADR-NNNN: Title`, Date, Status, Deciders, Context, Decision, Alternatives Considered, and Consequences for every `docs/adr/[0-9]*.md`. Only ADR-0006 complies. The other 18 use a short free-form style with no status or date, so their approval state isn't recorded.
- **Verdict:** ✅ Valid against the repo's own rule. But this is a scope decision, not a mechanical fix: either convert 18 ADRs to the template, or deliberately adopt the short style and amend `.claude/rules/adr-format.md` to match. Worth deciding with Eric before investing the conversion effort.
- **Suggested fix:** Pick one: (a) convert all 18 to the template (Date/Status/Deciders can be sourced from the PR history; each already contains Context/Decision/Alternatives in prose), or (b) relax the rule to require only the `# ADR-NNNN: Title` heading plus Date/Status/Deciders header block, keeping the body free-form.

## 26. The ADR index in docs/adr/README.md still says "_none yet_"

- **File:** `docs/adr/README.md:17`
- **Link:** https://github.com/linuxfoundation/insights/pull/1879#pullrequestreview-4915559530
- **Summary:** The rule requires an index row per ADR and removal of the placeholder once the first real ADR lands. The table still contains only the `_none yet_` row, so none of the 19 ADRs are discoverable through the canonical index.
- **Verdict:** ✅ Valid. Quick mechanical fix regardless of what happens with #25.
- **Suggested fix:** Replace the placeholder with one row per ADR: `| [ADR-NNNN](./NNNN-kebab-title.md) | Title | accepted | 2026-08-XX |`.
