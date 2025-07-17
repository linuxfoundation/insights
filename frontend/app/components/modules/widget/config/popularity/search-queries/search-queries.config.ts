// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import SearchQueries from './search-queries.vue'
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config'

const searchQueries: WidgetConfig = {
  key: 'searchQueries',
  name: 'Search queries volume',
  description: (project) => `Search interest volume of ${project.name} based on Keywords Everywhere.`,
  learnMoreLink: `/docs/metrics/popularity#search-queries`,
  component: SearchQueries,
  share: true,
  embed: true,
  snapshot: true,
  hideOnRepoFilter: true,
  benchmark: {
    title: 'Search Queries',
    showOnOverview: true,
    isVisible: () => true,
    points: {
      0: {
        type: 'negative',
        description: '{value} queries per month',
        text: `This project has extremely low online search visibility, 
        suggesting minimal public awareness or interest.`,
      },
      1: {
        type: 'negative',
        description: '{value} queries per month',
        text: `This project receives very limited search volume, 
        indicating low general awareness and engagement.`,
      },
      2: {
        type: 'warning',
        description: '{value} queries per month',
        text: `This project shows modest online interest, with a small but 
        growing presence in search queries.`,
      },
      3: {
        type: 'warning',
        description: '{value} queries per month',
        text: `This project enjoys a fair level of search interest, reflecting 
        moderate public awareness and community engagement.`,
      },
      4: {
        type: 'positive',
        description: '{value} queries per month',
        text: `This project benefits from strong search volume, indicating 
        significant recognition and a healthy level of public interest.`,
      },
      5: {
        type: 'positive',
        description: '{value} queries per month',
        text: `This project exhibits exceptional search interest, demonstrating high visibility 
        and widespread public engagement. Note that search volumes can be influenced by 
        trends or external factors, so it should be considered alongside other metrics.`,
      },
    },
  },
}

export default searchQueries
