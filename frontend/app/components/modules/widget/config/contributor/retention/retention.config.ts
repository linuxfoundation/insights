// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import Retention from './retention.vue';
import type { WidgetConfig, WidgetModel } from '~/components/modules/widget/config/widget.config';

const retention: WidgetConfig = {
  key: 'retention',
  name: 'Quarterly contributor retention',
  description: () =>
    'Share of contributors and organizations that contributed continuously ' +
    'in all consecutive quarters of the selected time period.',
  learnMoreLink: `/docs/metrics/contributors#retention`,
  defaultValue: {
    activeTab: 'contributors',
    includeCollaborations: false,
  },
  component: Retention,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Quarterly Contributor Retention Rate',
    showOnOverview: true,
    isVisible: (
      model: WidgetModel,
      _selectedTimeRangeKey: string,
      startDate: string,
      endDate: string,
    ) => {
      const start = DateTime.fromISO(startDate || '');
      const end = DateTime.fromISO(endDate || '');

      const isAboveThreshold = Math.ceil(end.diff(start, 'days').days) >= 180;

      return isAboveThreshold && model.activeTab === 'contributors';
    },
    points: {
      0: {
        type: 'negative',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has extremely low contributor retention, 
        indicating that nearly all contributors disengage after a single quarter.`,
      },
      1: {
        type: 'negative',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has very low contributor retention, 
        suggesting difficulty in keeping contributors engaged over time.`,
      },
      2: {
        type: 'warning',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has modest contributor retention, 
        with fewer than 10% of contributors returning in subsequent quarters.`,
      },
      3: {
        type: 'warning',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has decent contributor retention, 
        with 10%+ of contributors continuing their involvement.`,
      },
      4: {
        type: 'positive',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has strong contributor retention, 
        reflecting an engaged and consistent contributor base.`,
      },
      5: {
        type: 'positive',
        description: '{value}% of contributors are contributing quarter over quarter',
        text: `This project has excellent contributor retention, 
        indicating a highly engaged and stable community.`,
      },
    },
  },
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the retention rate for the last 3 quarters',
  },
  showCollabToggle: true,
};

export default retention;
