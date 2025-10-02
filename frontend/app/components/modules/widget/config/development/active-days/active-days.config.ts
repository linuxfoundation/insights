// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import ActiveDays from './active-days.vue'
import type { WidgetConfig, WidgetModel } from '~/components/modules/widget/config/widget.config'
import { Granularity } from '~~/types/shared/granularity'

const activeDays: WidgetConfig = {
  key: 'activeDays',
  name: 'Active days',
  description: () =>
    'Number of days contributors were actively involved in the project' +
    ' and the total contributions made' +
    ' during the selected period. This includes commits, pull requests, and more.',
  learnMoreLink: `/docs/metrics/development#active-days`,
  component: ActiveDays,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Active Days',
    showOnOverview: true,
    isVisible: (
      model: WidgetModel,
      _selectedTimeRangeKey: string,
      startDate: string,
      endDate: string,
    ) => {
      const start = DateTime.fromISO(startDate)
      const end = DateTime.fromISO(endDate)
      const diffInDays = Math.ceil(end.diff(start, 'days').days)

      return diffInDays === 30 && model.granularity === Granularity.DAILY
    },
    points: {
      0: {
        type: 'negative',
        description: 'Active on {value} of the last 365 days',
        text: `Project activity occurs on very few days, 
                indicating significant gaps in development continuity.`,
      },
      1: {
        type: 'negative',
        description: 'Active on {value} of the last 365 days',
        text: `Project shows infrequent activity patterns, 
                with notable gaps between development periods.`,
      },
      2: {
        type: 'warning',
        description: 'Active on {value} of the last 365 days',
        text: `This project demonstrates modest activity, 
                with contributions occurring on a fair number of days, 
                but still with room for improvement.`,
      },
      3: {
        type: 'warning',
        description: 'Active on {value} of the last 365 days',
        text: `This project shows moderate activity, 
                with regular contributions that reflect a steady pace of development.`,
      },
      4: {
        type: 'positive',
        description: 'Active on {value} of the last 365 days',
        text: `This project benefits from strong activity, with contributions on most days, 
                indicating a robust and engaged development process.`,
      },
      5: {
        type: 'positive',
        description: 'Active on {value} of the last 365 days',
        text: `Project demonstrates exceptionally consistent activity, 
                with development occurring multiple times per week.`,
      },
    },
  },
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the active days',
  },
  showCollabToggle: true,
}

export default activeDays
