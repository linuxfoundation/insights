# Leaderboards Component

This directory contains the leaderboard components for displaying various project rankings and metrics.

## Components

### LeaderboardDetail (`components/views/leaderboard-detail.vue`)

A comprehensive leaderboard view component that displays a ranked list of projects with their metrics and trends.

#### Features

- **Three-column layout**: Back button, main content (720px), and sidebar navigation (260px)
- **Search functionality**: Filter projects by name
- **Trend indicators**: Show up/down/neutral trends with percentages and change values
- **Responsive design**: Fixed widths for consistent layout
- **Dynamic routing**: Navigate between different leaderboards
- **Share functionality**: Share leaderboard via native share API or clipboard

#### Props

- `leaderboardKey` (required): String - The key identifying which leaderboard to display
- `items`: Array - List of leaderboard items (default: [])
- `highlightedIndex`: Number - Index of item to highlight (default: -1)

#### LeaderboardItem Interface

```typescript
interface LeaderboardItem {
  id: string;
  name: string;
  logo?: string;
  value: number;
  trend?: LeaderboardTrend;
}

interface LeaderboardTrend {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  change: number;
}
```

#### Usage Example

```vue
<template>
  <lfx-leaderboard-detail
    leaderboard-key="most-active-contributors"
    :items="leaderboardItems"
    :highlighted-index="1"
  />
</template>

<script setup lang="ts">
import LfxLeaderboardDetail from '~/components/modules/leaderboards/components/views/leaderboard-detail.vue';

const leaderboardItems = [
  {
    id: '1',
    name: 'The Linux Kernel',
    logo: 'https://example.com/logo.png',
    value: 100,
    trend: {
      direction: 'up',
      percentage: 2.3,
      change: 120,
    },
  },
  // ... more items
];
</script>
```

## Configuration

### Leaderboard Configs (`config/`)

Each leaderboard has a configuration file that defines:

- `key`: Unique identifier
- `name`: Display name
- `icon`: FontAwesome icon name
- `dataDisplay`: Component for rendering the metric
- `sort`: Sort order
- `columnLabel`: Label for the metric column

#### Example Config

```typescript
export const mostActiveContributorsConfig: LeaderboardConfig = {
  key: 'most-active-contributors',
  name: 'Most Active Contributors',
  icon: 'people-group',
  dataDisplay: NumericDataDisplay,
  sort: 'mostActiveContributors_DESC',
  columnLabel: 'Contributors (12M)',
};
```

## Data Display Components

Located in `components/data-displays/`, these components format the metric values:

- `numeric.vue`: Formats numbers with proper thousand separators
- `time-duration.vue`: Formats time durations

## Routing

The leaderboard detail view is accessible via:

```
/leaderboards/[key]
```

Where `[key]` is the leaderboard configuration key (e.g., `most-active-contributors`).

## Styling

The component uses Tailwind CSS with the project's design system:

- Colors: `neutral-*`, `positive-600`, `negative-600`, `brand-500`
- Fonts: Primary font for body text, `font-secondary` (Roboto Slab) for headings
- Spacing: Consistent with project standards (gap-2, gap-3, etc.)

## Navigation

The sidebar navigation displays all available leaderboards and highlights the active one. Clicking on a leaderboard navigates to its detail page.
