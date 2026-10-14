# Migrating to Health Score v2

LFX Insights scores projects with Health Score v2. `healthScore` and the Health Score v1 fields are soon to be deprecated, so integrations should read `healthScoreV2` and the other v2 fields instead. The endpoint URLs don't change. For how v2 is calculated, see [Health Score Explained](/metrics/health-score/).

## Fields

Fields returned by `GET /api/project/{slug}/insights`:

| Field | Status | Value |
|---|---|---|
| `healthScoreV2` | Use | Points out of `healthMaxScore`. Null for unscored projects |
| `healthMaxScore` | Use | 100, or 60, 65 or 75 when one category can't be measured |
| `healthLabel` | Use | `excellent`, `healthy`, `fair`, `concerning`, `critical` |
| `maintainerHealthScoreV2` | Use | 0-40 |
| `securitySupplyChainScoreV2` | Use | 0-35 |
| `developmentActivityScoreV2` | Use | 0-25 |
| `coveredCategoryCount` | Use | How many of the 3 categories have a score |
| `lifecycleLabel` | Use | `active`, `stable`, `declining`, `inert`, `abandoned`, `archived` |
| `healthScore` | Soon to be deprecated | Same value as `healthScoreV2`. Held the v1 score, out of 100, until August 2026 |
| `contributorHealthScore`, `popularityHealthScore`, `developmentHealthScore`, `securityHealthScore` | Soon to be deprecated | v1 category scores. They don't add up to `healthScoreV2` |

The other fields don't change.

`GET /api/project` returns `healthScoreV2`, `healthMaxScore`, `healthLabel` and `healthScoreV2Normalized`. Add `healthBreakdown=true` to get the category scores. On this endpoint `healthScore` still holds the v1 score and is soon to be deprecated.

## Bands

| v1 score | v1 label | v2 score (out of 100) | v2 label |
|---|---|---|---|
| 80-100 | Excellent | 85-100 | Excellent |
| 60-79 | Healthy | 70-84 | Healthy |
| 40-59 | Stable | 50-69 | Fair |
| 20-39 | Unsteady | 30-49 | Concerning |
| 0-19 | Critical | 0-29 | Critical |

Partial scores are graded after scaling to 100, so 52 out of 65 is Healthy.

v1 and v2 numbers can't be compared. Argo scored 81 in v1 and scores 70 in v2.

## Updating your integration

1. Read `healthScoreV2` instead of `healthScore`.
2. Display `healthLabel` and remove your own score thresholds.
3. When `healthMaxScore` is below 100, show it next to the score. LFX Insights shows `Healthy* (52/65)`.
4. When `healthScoreV2` is null, show "Not scored". Don't show 0.
5. Stop reading the four v1 category scores. If you show a breakdown, use the three v2 category scores.
6. Rename Stable to Fair and Unsteady to Concerning in your labels and icons. Remove any copy that mentions four areas or popularity, since v2 scores three categories and popularity isn't one of them.
7. Call only the endpoints in the [API reference](/api/). `/api/project/{slug}` returns the v1 score in `healthScore`, and `/api/widget/*` routes can change without notice.

## Example

```js
const res = await fetch(`https://insights.linuxfoundation.org/api/project/${slug}/insights`);
const { healthScoreV2, healthMaxScore, healthLabel } = await res.json();

const LABELS = {
  excellent: 'Excellent',
  healthy: 'Healthy',
  fair: 'Fair',
  concerning: 'Concerning',
  critical: 'Critical',
};

let text = 'Not scored';
if (healthScoreV2 !== null) {
  text =
    healthMaxScore < 100
      ? `${LABELS[healthLabel]}* (${healthScoreV2}/${healthMaxScore})`
      : `${LABELS[healthLabel]} (${healthScoreV2})`;
}
```
