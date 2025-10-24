// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DataSummary } from '../utils/data-summary';

export const auditorPrompt = (
  originalQuestion: string,
  reformulatedQuestion: string,
  dataSummary: DataSummary,
  attemptNumber: number,
  previousFeedback?: string,
) => {
  const statsFormatted = Object.entries(dataSummary.columnStats)
    .map(([col, stats]) => {
      const lines = [`- ${col} (${stats.type}):`];

      if (stats.nullPercentage > 0) {
        lines.push(`  • ${stats.nullPercentage}% null values`);
      }

      if (stats.type === 'numeric') {
        lines.push(`  • Range: ${stats.min} to ${stats.max}`);
        lines.push(`  • Average: ${stats.avg}`);
        if (stats.hasAllZeros) lines.push(`  • ⚠️ All values are zero`);
      }

      if (stats.type === 'date') {
        lines.push(`  • Date range: ${stats.dateRange}`);
        lines.push(`  • ${stats.distinctCount} distinct dates`);
      }

      if (stats.type === 'string') {
        lines.push(`  • ${stats.distinctCount} distinct values`);
      }

      return lines.join('\n');
    })
    .join('\n');

  return `You are an Auditor agent that validates whether retrieved data can answer the user's question.

## USER'S QUESTION
${originalQuestion}

## ENHANCED QUERY (Router's Interpretation)
${reformulatedQuestion}

## DATA SUMMARY
**Total Rows:** ${dataSummary.rowCount}
**Columns:** ${dataSummary.columns.join(', ')}

**Column Statistics:**
${statsFormatted}

${
  attemptNumber > 0
    ? `
## RETRY ATTEMPT #${attemptNumber + 1}
Previous feedback: ${previousFeedback}
⚠️ The router already tried once. Check if the issue was addressed.
`
    : ''
}

---

## YOUR TASK

Make a **BINARY decision**: Can this data answer the user's question?

### Validation Checklist

**1. Column Coverage**
- Are all required columns present?
- Do column names semantically match the question?

**2. Data Quality**
- Row count > 0?
- Key columns not 100% null?
- Numeric metrics not all zeros?

**3. Time Dimension (if applicable)**
- If question asks for time-series data (e.g., "daily activity", "monthly trends"), verify:
  - Date column exists in output
  - Date range matches question timeframe
  - Enough distinct dates for the requested granularity
- If question only filters by time (e.g., "top 5 orgs last quarter"), date column in output is NOT required
  - Time filtering happens in query, final result can be a simple list

**4. Granularity**
- If question asks "by company", is there a company/organization column?
- If question asks for breakdown, are grouping columns present?

**5. Metric Presence (context-dependent)**
- **Requires numeric metric** if question asks for:
  - Aggregations: "count", "total", "average", "sum"
  - Trends: "growth", "change", "increase"
  - Rankings: "top", "most", "highest", "bottom", "least", "lowest"
- **Does NOT require metric** for pure listing questions:
  - "which", "list all", "show", "enumerate", "what are the"
  - Example: "Which days had no activity" only needs date/repository columns, not an activity count column

### Decision Criteria

✅ **is_valid = true** IF:
- All required columns exist (even if imperfect names)
- Data has > 0 rows with non-null values
- For time-series questions: date column present and range matches
- For time-filtered questions: date column NOT required in output
- Granularity is appropriate (right grouping columns)
- For aggregation/ranking questions: relevant metric present
- For listing questions: metric NOT required

❌ **is_valid = false** IF:
- Missing critical columns (e.g., no metric for "show activity")
- 0 rows or all nulls/zeros in key columns
- Wrong time period (e.g., 2023 data for "2024" question)
- Wrong aggregation (e.g., monthly when daily requested)
- Columns completely irrelevant to question

### Output Requirements

**IF is_valid = true:**
- Set \`is_valid: true\`
- Write a brief \`summary\` (2-3 sentences) for the user:
  - What the data shows
  - Key findings based on statistics
  - Direct answer to their question
  - Example: "Commit activity in 2024 ranged from 0 to 453 per day across 12 companies, 
  with an average of 87 commits daily."

**IF is_valid = false:**
- Set \`is_valid: false\`
- Write \`feedback_to_router\` with SPECIFIC fixes:
  - What column is missing? (e.g., "Need commit_count or activity metric")
  - What's wrong with data? (e.g., "Date range is 2023, but question asks for 2024")
  - What should router try instead? (e.g., "Use active_contributors_by_date pipe instead")
  - Be direct and actionable

### Important Notes
- **Question type determines requirements:**
  - Time-series questions ("daily commits", "monthly trend") → need date column in output
  - Time-filtered questions ("top 5 last month") → date column NOT needed in output
  - Listing questions ("which repos", "list all") → metric NOT needed
  - Aggregation/ranking questions → metric IS needed
- **Statistics are your friend:** Use min/max/avg/range to validate without seeing raw data
- **Date ranges:** Only validate if question asks for time-series data, not just time-filtered results
- **Distinct counts matter:** Low distinctCount on grouping columns = problem
- **Don't be overly strict:** If data can partially answer, mark valid
- ${attemptNumber >= 1 ? '**This is a RETRY:** Be slightly more lenient unless clearly broken' : ''}

---

## REASONING FORMAT
Explain your decision in 2-3 sentences:
1. What you validated in the statistics
2. Whether it matches the question requirements
3. Your final decision
`;
};
