# Tinybird SQL Query Patterns

This reference contains common query patterns and anti-patterns for Tinybird SQL.

## Unnecessary Subqueries in FROM - AVOID

❌ **AVOID - Wrapping tables in subqueries:**
```sql
SELECT a.memberId, a.timestamp
FROM (
  SELECT activityId, memberId, timestamp, type
  FROM activityRelations_data_copilot
) AS a
WHERE a.type = 'commit'  -- ❌ Unnecessary subquery causes ambiguous identifier errors
```

✅ **PREFER - Direct table reference:**
```sql
SELECT a.memberId, a.timestamp
FROM activityRelations_data_copilot AS a
WHERE a.type = 'commit'  -- ✅ Simple and clear
```

✅ **When subqueries ARE needed:**
```sql
-- Pre-filtering or aggregation before JOIN
FROM (
  SELECT memberId, count(*) as activity_count
  FROM activityRelations_data_copilot
  WHERE timestamp >= subtractMonths(now(), 12)
  GROUP BY memberId
) AS active_members  -- ✅ Subquery adds value
```

## Retention Analysis Pattern

For retention/cohort analysis, use window functions with simple aggregations:
```sql
WITH user_months AS (
  SELECT DISTINCT
    memberId,
    toStartOfMonth(timestamp) as month
  FROM activityRelations_data_copilot
  WHERE segmentId = 'xxx' AND timestamp >= subtractMonths(now(), 12)
),
user_months_with_prev AS (
  SELECT
    memberId,
    month,
    lagInFrame(month, 1) OVER (PARTITION BY memberId ORDER BY month) as prev_month
  FROM user_months
),
retention_calc AS (
  SELECT
    month,
    count(DISTINCT memberId) as active_users,
    count(DISTINCT CASE
      WHEN dateDiff('month', prev_month, month) = 1 THEN memberId
    END) as retained_users
  FROM user_months_with_prev
  GROUP BY month
)
SELECT
  formatDateTime(month, '%Y-%m') as month,
  active_users,
  retained_users,
  round((retained_users * 100.0) / nullIf(active_users, 0), 2) as retention_rate
FROM retention_calc
ORDER BY month
```

## Correlated Subqueries - NEVER USE

❌ **AVOID - Tinybird does NOT support:**
```sql
SELECT
  month,
  (SELECT count(*) FROM table2 WHERE table2.month = table1.month) as count
FROM table1  -- ❌ Correlated subquery references outer column
```

✅ **USE - JOIN instead:**
```sql
SELECT
  t1.month,
  count(t2.id) as count
FROM table1 t1
LEFT JOIN table2 t2 ON t2.month = t1.month
GROUP BY t1.month
```

✅ **OR USE - Window functions:**
```sql
WITH combined AS (
  SELECT month, id FROM table1
  UNION ALL
  SELECT month, id FROM table2
)
SELECT DISTINCT
  month,
  count(id) OVER (PARTITION BY month) as count
FROM combined
```

## Anti-Join Pattern (Finding Missing Records)

**For anti-join patterns (finding rows in A that don't exist in B), use LEFT JOIN with empty string check.**

**IMPORTANT**: Tinybird has two key limitations:
1. NOT EXISTS with correlated subqueries is NOT supported
2. LEFT JOIN fills unmatched columns with default values (like '') instead of NULL

✅ **CORRECT (use LEFT JOIN + empty string check):**
```sql
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
```

❌ **AVOID (NOT EXISTS - will fail in Tinybird):**
```sql
WHERE NOT EXISTS (SELECT 1 FROM table_b b WHERE b.a_id = a.id)
```

❌ **AVOID (IS NULL check - will fail because Tinybird uses default values):**
```sql
LEFT JOIN table_b b ON b.a_id = a.id WHERE b.a_id IS NULL
```
