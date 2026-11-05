#!/usr/bin/env node
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Plans the sync between Claude Security findings and `security` issues in the ops repo.
// Pure function of its inputs: it never calls GitHub or Claude Security, so its output is the dry run.
//
// Usage: node plan-sync.mjs --findings <file> --issues <file> --project <file> --out <dir>
//   --findings  list_findings result(s): a JSON object with `data`, or an array of such objects
//   --issues    ops issues labelled `security`, open and closed: [{ number, state, state_reason, body, comments: [{ body }] }]
//   --project   get_project result, used to map evidence asset ids to repositories
// Writes <out>/plan.json (actions) and <out>/preview.md (every issue that would be created).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const FINDING_MARKER = /<!-- claude-security-finding: (find_[A-Za-z0-9]+) -->/;
const RESOLVED_MARKER = '<!-- claude-security-resolved:';
const MAX_TITLE = 120;

const SEVERITY = {
  critical: { label: '🔴 Critical', priority: 'Urgent', board: 'Critical', rank: 0 },
  high: { label: '🟠 High', priority: 'High', board: 'High', rank: 1 },
  medium: { label: '🟡 Medium', priority: 'Medium', board: 'Medium', rank: 2 },
  low: { label: '🟢 Low', priority: 'Low', board: 'Low', rank: 3 },
};

const { values: args } = parseArgs({
  options: {
    findings: { type: 'string' },
    issues: { type: 'string' },
    project: { type: 'string' },
    out: { type: 'string' },
  },
});
for (const name of ['findings', 'issues', 'project', 'out']) {
  if (!args[name]) throw new Error(`--${name} is required`);
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const findingsInput = readJson(args.findings);
const findings = (Array.isArray(findingsInput) ? findingsInput : [findingsInput]).flatMap(
  (page) => page.data ?? [],
);
const issues = readJson(args.issues);
const project = readJson(args.project);

const repoByAsset = new Map(
  (project.assets ?? []).map((a) => [a.id, a.repository_url.replace('https://github.com/', '')]),
);

const severityOf = (f) => (typeof f.severity === 'string' ? f.severity : f.severity?.type);
const statusOf = (f) => (typeof f.status === 'string' ? f.status : f.status?.type);

function repoName(f) {
  const full = repoByAsset.get(f.evidence?.[0]?.asset_id) ?? 'linuxfoundation/insights';
  return { full, short: full.split('/')[1] };
}

function locationLink(repo, loc) {
  const range =
    loc.end_line_number && loc.end_line_number !== loc.start_line_number
      ? `L${loc.start_line_number}-L${loc.end_line_number}`
      : `L${loc.start_line_number}`;
  const text = `${loc.path}:${loc.start_line_number}${loc.end_line_number ? `-${loc.end_line_number}` : ''}`;
  return `[\`${text}\`](https://github.com/${repo}/blob/${loc.commit}/${loc.path}#${range})`;
}

// The assessment is "who the attacker is and what they need", then "Impact: ...".
function splitAssessment(text = '') {
  const at = text.search(/^Impact:/m);
  if (at === -1) return { preconditions: text.trim(), impact: '' };
  return {
    preconditions: text.slice(0, at).trim(),
    impact: text
      .slice(at)
      .replace(/^Impact:\s*/, '')
      .trim(),
  };
}

// The recommendation interleaves fix text with "Fix criteria: ..." paragraphs, one per numbered part.
function splitRecommendation(text = '') {
  const paragraphs = text.split(/\n{2,}/);
  const fix = [];
  const criteria = [];
  let part = '';
  for (const p of paragraphs) {
    const numbered = p.match(/^\((\d+)\)/);
    if (numbered) part = `(${numbered[1]}) `;
    if (p.startsWith('Fix criteria:')) criteria.push(part + p.replace(/^Fix criteria:\s*/, ''));
    else fix.push(p);
  }
  return { fix: fix.join('\n\n').trim(), criteria };
}

function title(f, repo) {
  const prefix = `[Security] ${repo.short}: `;
  const room = MAX_TITLE - prefix.length;
  const t = f.title.length > room ? `${f.title.slice(0, room - 1).trimEnd()}…` : f.title;
  return prefix + t;
}

function body(f, repo) {
  const sev = SEVERITY[severityOf(f)];
  const locations = f.evidence?.flatMap((e) => e.locations ?? []) ?? [];
  const first = locations[0];
  const cwe = f.category?.cwe_id?.replace('CWE-', '');
  const { preconditions, impact } = splitAssessment(f.assessment);
  const { fix, criteria } = splitRecommendation(f.recommendation);

  return `<!-- claude-security-finding: ${f.id} -->
<!-- Created by /sync-security-findings from Claude Security. Edit freely; the marker above links this issue to the finding. -->

| Field | Value |
|---|---|
| **Severity** | ${sev.label} |
| **Repository** | ${repo.full} |
| **Branch / Commit** | \`main\` @ \`${first?.commit?.slice(0, 7) ?? 'unknown'}\` |
| **First seen** | ${f.created_at.slice(0, 10)} |
| **Category** | ${f.category?.name ?? 'Unknown'} |
| **CWE** | ${cwe ? `[CWE-${cwe}](https://cwe.mitre.org/data/definitions/${cwe}.html)` : 'n/a'} |
| **Location** | ${first ? locationLink(repo.full, first) : 'n/a'} |
| **Source finding** | [Claude Security \`${f.id}\`](${f.web_url}) |

## Details

${f.description?.trim() ?? ''}

## Evidence

${locations.map((loc, i) => `${i + 1}. ${locationLink(repo.full, loc)}`).join('\n')}

## Impact

${impact || '_See Details._'}

## Reproduction steps

${preconditions || '_See the source finding._'}

## Recommended fix

${fix || '_See the source finding._'}

**Fix criteria:**

${criteria.length ? criteria.map((c) => `- ${c}`).join('\n') : '_See the source finding._'}

---

To fix: run \`/fix-security-finding linuxfoundation/lfx-cdp-insights-ops#<this issue>\` in the insights repo. After the PR merges, run \`/resolve-security-finding\` with the same reference.
`;
}

const issueByFinding = new Map();
for (const issue of issues) {
  const id = issue.body?.match(FINDING_MARKER)?.[1];
  if (id && !issueByFinding.has(id)) issueByFinding.set(id, issue);
}
const hasResolvedMarker = (issue) =>
  (issue.comments ?? []).some((c) => c.body?.includes(RESOLVED_MARKER));

const actions = [];
const seen = new Set();

for (const f of [...findings].sort(
  (a, b) => SEVERITY[severityOf(a)].rank - SEVERITY[severityOf(b)].rank,
)) {
  seen.add(f.id);
  const issue = issueByFinding.get(f.id);
  const open = statusOf(f) === 'open';
  const repo = repoName(f);
  const sev = SEVERITY[severityOf(f)];
  const base = { finding: f.id, severity: severityOf(f), title: title(f, repo) };

  if (!issue) {
    if (open)
      actions.push({
        ...base,
        action: 'create',
        labels: ['security'],
        type: 'Bug',
        priority: sev.priority,
        board: { Team: 'Insights', Severity: sev.board, 'Source repo': repo.short },
        body: body(f, repo),
      });
    continue;
  }

  const ref = { ...base, issue: issue.number };
  if (issue.state === 'open' && open) {
    const current = issue.body.match(/\| \*\*Severity\*\* \| (.+) \|/)?.[1];
    actions.push(
      current && current !== sev.label
        ? { ...ref, action: 'update-severity', from: current, to: sev.label }
        : { ...ref, action: 'none' },
    );
  } else if (issue.state === 'open' && !open) {
    actions.push({ ...ref, action: 'close', reason: 'resolved in Claude Security' });
  } else if (open) {
    actions.push(
      hasResolvedMarker(issue)
        ? { ...ref, action: 'reopen-regression' }
        : { ...ref, action: 'remind-resolve' },
    );
  } else {
    actions.push({ ...ref, action: 'none' });
  }
}

// Open issues whose finding is no longer listed: resolved in Claude Security, or listed under another status.
for (const [id, issue] of issueByFinding) {
  if (!seen.has(id) && issue.state === 'open')
    actions.push({ finding: id, issue: issue.number, action: 'check-status' });
}

const counts = actions.reduce((acc, a) => ({ ...acc, [a.action]: (acc[a.action] ?? 0) + 1 }), {});

mkdirSync(args.out, { recursive: true });
writeFileSync(join(args.out, 'plan.json'), `${JSON.stringify({ counts, actions }, null, 2)}\n`);
writeFileSync(
  join(args.out, 'preview.md'),
  actions
    .filter((a) => a.action === 'create')
    .map(
      (a) =>
        `# ${a.title}\n\nLabels: ${a.labels.join(', ')} · Type: ${a.type} · Priority: ${a.priority} · Board: ${Object.entries(
          a.board,
        )
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}\n\n${a.body}`,
    )
    .join('\n\n<!-- ======================================================== -->\n\n'),
);

const lines = actions.map(
  (a) =>
    `${a.action.padEnd(17)} ${(a.severity ?? '').padEnd(8)} ${a.issue ? `#${a.issue} ` : ''}${a.title ?? a.finding}`,
);
process.stdout.write(`${[JSON.stringify(counts), ...lines].join('\n')}\n`);
