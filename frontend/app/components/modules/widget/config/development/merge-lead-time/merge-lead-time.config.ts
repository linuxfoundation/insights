// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import MergeLeadTime from './merge-lead-time.vue'
import type { WidgetConfig, WidgetModel } from '~/components/modules/widget/config/widget.config'

const mergeLeadTime: WidgetConfig = {
  key: 'mergeLeadTime',
  name: 'Merge lead time',
  description: () =>
    'Average time taken for pull requests to be raised, reviewed, ' +
    'accepted, and merged in the selected period.',
  learnMoreLink: `/docs/metrics/development#merge-lead-time`,
  component: MergeLeadTime,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Merge Lead Time',
    showOnOverview: true,
    isVisible: (
      _model: WidgetModel,
      _selectedTimeRangeKey: string,
      startDate: string,
      endDate: string,
    ) => {
      const start = DateTime.fromISO(startDate)
      const end = DateTime.fromISO(endDate)
      const diffInDays = Math.ceil(end.diff(start, 'days').days)

      return diffInDays > 30
    },
    points: {
      0: {
        type: 'negative',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project has extremely slow pull request merging, 
					indicating significant delays in review and integration processes.`,
      },
      1: {
        type: 'negative',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project shows a very slow merge process, 
					suggesting challenges in timely reviewing and merging of contributions.`,
      },
      2: {
        type: 'warning',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project demonstrates a modest merge lead time, 
					with noticeable delays that could impede development velocity.`,
      },
      3: {
        type: 'warning',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project exhibits a reasonable merge lead time, 
					reflecting a balanced and consistent review process.`,
      },
      4: {
        type: 'positive',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project benefits from fast merging of pull requests, 
					indicating an efficient and responsive review workflow.`,
      },
      5: {
        type: 'positive',
        description: 'Average lifespan of a PR is {value} days',
        text: `This project benefits from exceptionally fast merging of pull requests, 
					reflecting a highly efficient development process.`,
      },
    },
  },
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the merge lead time',
  },
}

export default mergeLeadTime
