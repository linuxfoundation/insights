// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PullRequests from './pull-requests.vue'
import { Granularity } from '~~/types/shared/granularity'
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config'

const pullRequests: WidgetConfig = {
  key: 'pullRequests',
  name: 'Pull requests',
  description: () => 'Comparison between opened and merged (or closed) pull requests during the selected period.',
  learnMoreLink: `/docs/metrics/development#pull-requests`,
  component: PullRequests,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'New Pull Requests per Month',
    showOnOverview: true,
    isVisible: (model: Record<string, number | boolean | string>) => model.granularity === Granularity.MONTHLY,
    points: {
      0: {
        type: 'negative',
        description: '{value} new pull requests per month',
        text: `This project has extremely low pull request activity, 
					which may indicate a lack of ongoing development or community engagement.`,
      },
      1: {
        type: 'negative',
        description: '{value} new pull requests per month',
        text: `This project has very low pull request activity, 
					suggesting limited development momentum and external contributions.`,
      },
      2: {
        type: 'warning',
        description: '{value} new pull requests per month',
        text: `This project has low pull request activity, with a small number of contributions being proposed.`,
      },
      3: {
        type: 'warning',
        description: '{value} new pull requests per month',
        text: `This project has modest pull request activity.`,
      },
      4: {
        type: 'positive',
        description: '{value} new pull requests per month',
        text: `This project has strong pull request activity, 
        with a healthy influx of contributions indicating robust ongoing improvements.`,
      },
      5: {
        type: 'positive',
        description: '{value} new pull requests per month',
        text: `This project has excellent pull request activity, 
					signaling a vibrant development process and high community involvement.`,
      },
    },
  },
  copilot: {
    icon: 'code-pull-request',
    suggestions: 'How many pull requests are there?'
  },
}

export default pullRequests
