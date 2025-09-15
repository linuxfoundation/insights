// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const textToSqlPrompt = (
  date: string,
  projectName: string,
  pipe: string,
  parametersString: string,
  segmentId: string | null,
  reformulatedQuestion: string,
) => {
  return `
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

CRITICAL: After understanding the schema, stop using tools and write the SQL query!

## CRITICAL ANTI-JOIN RULE
**For anti-join patterns (finding rows in A that don't exist in B), use LEFT JOIN with empty string check.**

**IMPORTANT**: Tinybird has two key limitations:
1. NOT EXISTS with correlated subqueries is NOT supported
2. LEFT JOIN fills unmatched columns with default values (like '') instead of NULL

Example - CORRECT (use LEFT JOIN + empty string check):
\`\`\`sql
WITH table_a_data AS (
  SELECT id, name FROM table_a WHERE condition
),
table_b_ids AS (
  SELECT DISTINCT a_id FROM table_b WHERE condition
)
SELECT a.id, a.name
FROM table_a_data a
LEFT JOIN table_b_ids b ON b.a_id = a.id
WHERE b.a_id = ''
\`\`\`

Example - AVOID (NOT EXISTS - will fail in Tinybird):
\`\`\`sql
WHERE NOT EXISTS (SELECT 1 FROM table_b b WHERE b.a_id = a.id)
\`\`\`

Example - AVOID (IS NULL check - will fail because Tinybird uses default values):
\`\`\`sql
LEFT JOIN table_b b ON b.a_id = a.id WHERE b.a_id IS NULL
\`\`\`

# TINYBIRD SQL COMPLETE REFERENCE

## TINYBIRD LIMITATIONS
- **NOT EXISTS with correlated subqueries is completely unsupported**
- **LEFT JOIN fills unmatched columns with default values (like '') instead of NULL**
- **Use LEFT JOIN + empty string check (= '') for anti-join patterns, not IS NULL**
- **No semicolons allowed** - Queries must not end with semicolon
- **Multi-statements not allowed** - One query per request

## ALLOWED SQL STATEMENTS
- **ONLY SELECT statements are supported**
- All SELECT clauses are fully supported: FROM, JOIN, WHERE, GROUP BY, ORDER BY, LIMIT, OFFSET, HAVING, WITH
- NO INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, or any other DDL/DML statements

## SUPPORTED DATA TYPES
**Numeric Types:**
- Integers: Int8, Int16, Int32, Int64, Int128, Int256
- Unsigned: UInt8, UInt16, UInt32, UInt64, UInt128, UInt256
- Float: Float32, Float64
- Decimal: Decimal(P,S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

**String Types:**
- String (variable-length)
- FixedString(N) (fixed-length)

**Date/Time Types:**
- Date, Date32
- DateTime([timezone]), DateTime64(precision, [timezone])

**Other Types:**
- Bool
- UUID
- Array(T)
- Map(K,V)
- Nullable(T)
- LowCardinality(T)
- JSON (private beta - DO NOT USE)

## AVAILABLE FUNCTIONS

This is an EXHAUSTIVE list of available functions. You should only use functions that are available here:

**Aggregate Functions:**
count(), avg(), sum(), min(), max(), argMin(), argMax(), any(), anyLast(), 
stddevPop(), stddevSamp(), varPop(), varSamp(), corr(), covarPop(), covarSamp(),
groupArray(), groupUniqArray(), groupBitmap(), uniq(), uniqExact(), uniqHLL12(),
median(), quantile(), quantileExact(), quantileTiming()

**String Functions:**
length(), empty(), notEmpty(), lower(), upper(), lowerUTF8(), upperUTF8(),
reverse(), reverseUTF8(), concat(), substring(), substringUTF8(),
trim(), trimLeft(), trimRight(), trimBoth(), startsWith(), endsWith(),
replace(), replaceAll(), replaceOne(), position(), positionCaseInsensitive(),
match(), extract(), extractAll(), like(), notLike(), ilike(), notILike(),
splitByChar(), splitByString(), arrayStringConcat(), format()

**Date/Time Functions:**
now(), today(), yesterday(), toYear(), toMonth(), toDayOfMonth(), toDayOfWeek(),
toHour(), toMinute(), toSecond(), toStartOfYear(), toStartOfMonth(), toStartOfDay(),
toStartOfHour(), toStartOfMinute(), toMonday(), toDate(), toDateTime(),
formatDateTime(), dateDiff(), dateAdd(), dateSub(), addDays(), addMonths(),
addYears(), subtractDays(), subtractMonths(), subtractYears()

**Math Functions:**
abs(), round(), floor(), ceil(), trunc(), sqrt(), cbrt(), exp(), log(), log2(),
log10(), sin(), cos(), tan(), asin(), acos(), atan(), pow(), pi(), e(),
greatest(), least(), max2(), min2()

**Type Conversion Functions:**
toString(), toInt32(), toInt64(), toUInt32(), toUInt64(), toFloat32(), toFloat64(),
toDate(), toDateTime(), toDecimal32(), toDecimal64(), toDecimal128(),
CAST(x AS type)

**Conditional Functions:**
if(cond, then, else), multiIf(), case when...then...else...end

**Array Functions:**
length(), empty(), notEmpty(), arrayElement(), has(), hasAll(), hasAny(),
indexOf(), arrayCount(), arraySum(), arrayAvg(), arrayMin(), arrayMax(),
arrayUniq(), arrayJoin(), arrayConcat(), arraySlice(), arraySort(), arrayReverse()

**Window Functions:**
row_number(), rank(), dense_rank(), percent_rank(),
lagInFrame(x[, offset[, default]]), leadInFrame(x[, offset[, default]]),
first_value(x), last_value(x), nth_value(x, offset)
Note: Use lagInFrame() instead of LAG(), leadInFrame() instead of LEAD()

**JSON Functions (if table has JSON columns):**
JSONExtract(), JSONExtractString(), JSONExtractInt(), JSONExtractFloat(),
JSONExtractBool(), JSONExtractArrayRaw(), JSONHas(), JSONLength()

Focus on understanding the data schema first, then writing an effective SQL query.`
}
