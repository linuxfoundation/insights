// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import Stars from './stars.vue'
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config'

const stars: WidgetConfig = {
  key: 'stars',
  name: 'Stars',
  description: () => 'New stars added to the project repositories during the selected time period.',
  learnMoreLink: `/docs/metrics/popularity#stars`,
  component: Stars,
  defaultValue: {
    activeTab: 'new',
  },
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'GitHub Stars',
    showOnOverview: true,
    isVisible: () => true,
    points: {
      0: {
        type: 'negative',
        description: '{value} GitHub stars',
        text: `This project has very low visibility. Keep in mind, however, 
				that star counts can be influenced by factors other than 
				genuine community engagement.`,
      },
      1: {
        type: 'negative',
        description: '{value} GitHub stars',
        text: `This project has low visibility, though star counts may not 
				fully capture its actual usage or value and can be 
				susceptible to targeted promotion.`,
      },
      2: {
        type: 'warning',
        description: '{value} GitHub stars',
        text: `This project has moderate visibility, but remember that stars 
				can be affected by promotional efforts and may not represent sustained 
				interest over time.`,
      },
      3: {
        type: 'warning',
        description: '{value} GitHub stars',
        text: `This project has good visibility. However, note that high star 
				counts can sometimes be boosted by short-term trends 
				or social media campaigns.`,
      },
      4: {
        type: 'positive',
        description: '{value} GitHub stars',
        text: `This project has great visibility, though stars should be 
				considered alongside other metrics to avoid potential 
				gaming of the system.`,
      },
      5: {
        type: 'positive',
        description: '{value} GitHub stars',
        text: `This project has great visibility on GitHub. It's important 
				to assess this in context, as star counts can be artificially inflated.`,
      },
    },
  },
  copilot: {
    icon: 'star',
    suggestions: 'How many stars does this project have?'
  },
}

export default stars
