// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Load reference documentation files
 */
function loadReferenceDoc(filename: string): string {
  try {
    const path = join(__dirname, filename)
    return readFileSync(path, 'utf-8')
  } catch (error) {
    console.warn(`Failed to load ${filename}:`, error)
    return ''
  }
}

interface SqlErrorContext {
  errorMessage: string
  previousQuery: string
  attemptNumber: number
}

export const textToSqlPrompt = (
  date: string,
  projectName: string,
  pipe: string,
  parametersString: string,
  segmentId: string | null,
  reformulatedQuestion: string,
  errorContext?: SqlErrorContext,
) => {
  const basePrompt = `
You need to generate a SQL query to answer: "${reformulatedQuestion}"

Context:
- Date: ${date}
- Project: ${projectName}
- Segment ID: ${segmentId || 'not specified'}

Instructions:
1. BRIEFLY use list_datasources to understand available tables
2. Optionally use 1-2 other tools for quick data exploration
3. THEN IMMEDIATELY write a SQL query that answers the question
4. You have maximum 3 steps - use them wisely
5. Your final response MUST contain the SQL query in markdown code block
6. **IMPORTANT: Always add LIMIT 100 to your query unless a specific limit is mentioned**

CRITICAL: After understanding the schema, stop using tools and write the SQL query!

**NOTE:** The router agent has already analyzed activity types when needed.
If the reformulated question mentions specific activity types (e.g., "authored-commit", "pull_request-opened"),
use those types directly in your query. The router has already looked them up in the activityTypes table for you.

## TOP 8 TINYBIRD CONSTRAINTS

1. **Keep queries simple**: Max 3-4 CTEs. More causes parsing errors.
2. **No correlated subqueries**: Use JOINs or window functions instead.
3. **No range-based JOINs**: NEVER use \`ON col >= start AND col <= end\` - 
causes performance errors. Use window functions or simple equality joins.
4. **Anti-joins use empty string check**: LEFT JOIN with \`WHERE col = ''\`, NOT \`IS NULL\`.
5. **No semicolons**: Queries must not end with semicolon.
6. **Window functions**: Use \`lagInFrame()\` not \`LAG()\`, \`leadInFrame()\` not \`LEAD()\`.
7. **No UNION or UNION ALL**: TinyBird SQL API does not support UNION queries - 
NEVER use UNION, UNION ALL, or UNION DISTINCT. Return single result set instead.
8. **ALWAYS add LIMIT 100**: Unless question specifies a different limit, end your query with LIMIT 100.

## QUERY COMPLEXITY GUIDELINES

**CRITICAL: Prefer simple queries over complex nested CTEs**

- **Maximum 3-4 CTEs** - More than 4 CTEs often causes parsing errors
- **Use window functions** (lagInFrame, leadInFrame) instead of self-joins
- **Avoid nested subqueries in FROM** - Only use when pre-aggregating or filtering
- **Direct table references** preferred over unnecessary subqueries

**Example - SIMPLE (preferred):**
\`\`\`sql
WITH base_data AS (
  SELECT ..., lagInFrame(...) OVER (...) as prev_value
  FROM table WHERE conditions
)
SELECT ... FROM base_data WHERE ...
\`\`\`

**Example - TOO COMPLEX (avoid):**
\`\`\`sql
WITH cte1 AS (...), cte2 AS (...), cte3 AS (...), cte4 AS (...), cte5 AS (...)
SELECT ... -- 5+ CTEs = RISKY
\`\`\`

## COMMON PATTERNS

**Anti-join (finding missing records):**
\`\`\`sql
SELECT a.* FROM table_a a
LEFT JOIN table_b b ON b.id = a.id
WHERE b.id = ''  -- Use '' not IS NULL
\`\`\`

**Window functions for analytics:**
\`\`\`sql
SELECT
  memberId,
  lagInFrame(value, 1) OVER (PARTITION BY memberId ORDER BY date) as prev_value
FROM table
\`\`\`

**Rolling windows / time-based aggregations:**
\`\`\`sql
-- ❌ WRONG: Range-based JOIN (causes performance errors)
LEFT JOIN dates d ON activity_date >= d.window_start AND activity_date <= d.window_end

-- ✅ RIGHT: Use window functions with ROWS/RANGE frames
SELECT
  date,
  count(*) OVER (ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as rolling_count
FROM table
\`\`\`

**Date range filtering:**
\`\`\`sql
-- ❌ WRONG: Cartesian product with range JOIN
FROM date_range dr LEFT JOIN events e ON e.date >= dr.start AND e.date <= dr.end

-- ✅ RIGHT: Simple WHERE clause or direct aggregation
SELECT toStartOfInterval(date, INTERVAL 30 DAY) as period, count(*)
FROM events
WHERE date >= '2024-01-01' AND date <= '2024-12-31'
GROUP BY period
\`\`\`

**Combining different data types (NO UNION allowed):**
\`\`\`sql
-- ❌ WRONG: Using UNION (not supported in TinyBird SQL API)
SELECT 'histogram' as type, bucket, count FROM histogram_buckets
UNION ALL
SELECT 'stats' as type, metric_name, value FROM statistics

-- ✅ RIGHT: Single query with all data, use type column or separate queries
SELECT
  'histogram' as record_type,
  bucket as category,
  count as value,
  NULL as metric_name
FROM histogram_buckets
-- For statistics, either add them as special rows or return in separate query
-- You cannot combine with UNION in TinyBird
\`\`\``

  // Add error-specific guidance if this is a retry
  let errorGuidance = ''
  if (errorContext) {
    errorGuidance = `

## ⚠️ PREVIOUS ATTEMPT FAILED - RETRY #${errorContext.attemptNumber}

**Error:** ${errorContext.errorMessage}

**Previous Query:**
\`\`\`sql
${errorContext.previousQuery}
\`\`\`

**Your Task:** Analyze the error and generate a CORRECTED query. Common fixes:
- **Unknown function**: Check function name spelling or use available alternatives
- **Ambiguous column**: Add table aliases or qualify column names
- **Syntax error**: Check for semicolons, correlated subqueries, or unsupported syntax
- **Type mismatch**: Add explicit CAST() or use correct comparison types`

    // Load additional reference docs for error resolution
    const functionsRef = loadReferenceDoc('tinybird-functions.md')
    const patternsRef = loadReferenceDoc('tinybird-patterns.md')

    if (functionsRef) {
      errorGuidance += `\n\n## AVAILABLE FUNCTIONS REFERENCE\n${functionsRef}`
    }
    if (patternsRef) {
      errorGuidance += `\n\n## QUERY PATTERNS REFERENCE\n${patternsRef}`
    }
  }

  return basePrompt + errorGuidance
}
