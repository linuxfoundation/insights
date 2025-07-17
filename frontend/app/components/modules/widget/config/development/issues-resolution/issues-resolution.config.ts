// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import IssuesResolution from './issues-resolution.vue'
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config'
import { Granularity } from '~~/types/shared/granularity'

const issuesResolution: WidgetConfig = {
  key: 'issuesResolution',
  name: 'Issues resolution',
  description: () => 'Comparison between total number of issues vs. closed issues during the selected time period.',
  learnMoreLink: `/docs/metrics/development#issues-resolution`,
  component: IssuesResolution,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Issues Resolution',
    showOnOverview: true,
    isVisible: (
      model: Record<string, number | boolean | string>,
      _selectedTimeRangeKey: string,
      startDate: string,
      endDate: string
    ) => {
      const start = DateTime.fromISO(startDate)
      const end = DateTime.fromISO(endDate)
      const diffInDays = Math.ceil(end.diff(start, 'days').days)

      return diffInDays > 60 && model.granularity === Granularity.WEEKLY
    },
    points: {
      0: {
        type: 'negative',
        description: 'Average issue resolution time is over {value} days',
        text: `This project has a slow issue resolution, 
                indicating potential challenges in overall responsiveness.`,
      },
      1: {
        type: 'negative',
        description: 'Average issue resolution time is {value} days',
        text: `This project takes a long time to resolve issues, 
                suggesting a lag in responsiveness and possible maintenance delays.`,
      },
      2: {
        type: 'warning',
        description: 'Average issue resolution time is {value} days',
        text: `This project shows modest responsiveness, 
                though there is room for improvement in handling issues more efficiently.`,
      },
      3: {
        type: 'warning',
        description: 'Average issue resolution time is {value} days',
        text: `This project demonstrates reasonable issue resolution times, 
            reflecting a balanced approach to maintenance and responsiveness.`,
      },
      4: {
        type: 'positive',
        description: 'Average issue resolution time is {value} days',
        text: `This project benefits from fast issue resolution, 
            indicating effective maintenance and a proactive approach to addressing problems.`,
      },
      5: {
        type: 'positive',
        description: 'Average issue resolution time is {value} days',
        text: `This project benefits from exceptional issue resolution, 
            ensuring issues are resolved promptly and maintaining a high quality standard.`,
      },
    },
  },
}

export default issuesResolution
