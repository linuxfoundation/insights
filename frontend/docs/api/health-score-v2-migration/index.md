# Migrating to Health Score v2

The public API now returns Health Score v2. The endpoint URLs did not change. This page lists what changed for integrations built on Health Score v1. For how v2 is calculated, see [Health Score Explained](/metrics/health-score/).

## Field changes

Fields returned by `GET /api/project/{slug}/insights`:

| Field | v1 | v2 |
|---|---|---|
| `healthScore` | 0-100, never null | Points out of `healthMaxScore`. Null for unscored projects |
| `healthMaxScore` | Not returned | 100, or 60, 65 or 75 when one category can't be measured |
| `healthLabel` | Not returned | `excellent`, `healthy`, `fair`, `concerning`, `critical` |
| `healthScoreV2` | Not returned | Same value as `healthScore` |
| `maintainerHealthScoreV2` | Not returned | 0-40 |
| `securitySupplyChainScoreV2` | Not returned | 0-35 |
| `developmentActivityScoreV2` | Not returned | 0-25 |
| `coveredCategoryCount` | Not returned | How many of the 3 categories have a score |
| `lifecycleLabel` | Not returned | `active`, `stable`, `declining`, `inert`, `abandoned`, `archived` |
| `contributorHealthScore`, `popularityHealthScore`, `developmentHealthScore`, `securityHealthScore` | v1 category scores | Deprecated. Still v1 values, so they don't add up to `healthScore` |

The other fields are unchanged.

`GET /api/project` returns `healthScoreV2`, `healthMaxScore`, `healthLabel` and `healthScoreV2Normalized`. Add `healthBreakdown=true` to get the category scores. The `healthScore` field on this endpoint is not the v2 score, so read `healthScoreV2` instead.

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

1. Display `healthLabel` and remove your own score thresholds.
2. When `healthMaxScore` is below 100, show it next to the score. LFX Insights shows `Healthy* (52/65)`.
3. When `healthScore` is null, show "Not scored". Don't show 0.
4. Stop reading the four v1 category scores. If you show a breakdown, use the three v2 category scores.
5. Rename Stable to Fair and Unsteady to Concerning in your labels and icons. Remove any copy that mentions four areas or popularity, since v2 scores three categories and popularity isn't one of them.
6. Call only the endpoints in the [API reference](/api/). `/api/project/{slug}` still returns the v1 score in `healthScore`, and `/api/widget/*` routes can change without notice.

## Example

```js
const res = await fetch(`https://insights.linuxfoundation.org/api/project/${slug}/insights`);
const { healthScore, healthMaxScore, healthLabel } = await res.json();

const LABELS = {
  excellent: 'Excellent',
  healthy: 'Healthy',
  fair: 'Fair',
  concerning: 'Concerning',
  critical: 'Critical',
};

let text = 'Not scored';
if (healthScore !== null) {
  text =
    healthMaxScore < 100
      ? `${LABELS[healthLabel]}* (${healthScore}/${healthMaxScore})`
      : `${LABELS[healthLabel]} (${healthScore})`;
}
```
