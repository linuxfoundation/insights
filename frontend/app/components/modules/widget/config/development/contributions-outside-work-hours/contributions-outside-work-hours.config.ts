// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributionsOutsideWorkHours from './contributions-outside-work-hours.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const contributionsOutsideWorkHours: WidgetConfig = {
  key: 'contributionsOutsideWorkHours',
  name: 'Contributions outside work hours',
  description: () =>
    'Contributors’ activity patterns focused on contributions performed during non-business hours ' +
    'and weekends during the selected period.',
  learnMoreLink: `/docs/metrics/development#contributions-outside-work-hours`,
  component: ContributionsOutsideWorkHours,
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Contributions Outside Work Hours',
    showOnOverview: true,
    isVisible: () => true,
    points: {
      0: {
        type: 'negative',
        description: '{value}% of contributions occur outside regular working hours',
        text: `This project mostly depends on contributors working outside of working hours.`,
      },
      1: {
        type: 'negative',
        description: '{value}% of contributions occur outside regular working hours',
        text: `This project highly depends on contributors working outside of working hours.`,
      },
      2: {
        type: 'warning',
        description: '{value}% of contributions occur outside regular working hours',
        text: `This project depends on contributors working outside of working hours.`,
      },
      3: {
        type: 'warning',
        description: '{value}% of contributions occur outside regular working hours',
        text: `Contributions are mostly made during working hours.`,
      },
      4: {
        type: 'positive',
        description: '{value}% of contributions occur outside regular working hours',
        text: `Most of the contributions are made during working hours, 
                indicating a healthy & sustainable development process.`,
      },
      5: {
        type: 'positive',
        description: '{value}% of contributions occur outside regular working hours',
        text: `Almost all contributions are made during working hours, 
                indicating a very healthy & sustainable development process.`,
      },
    },
  },
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the contributions outside work hours',
  },
  showCollabToggle: true,
};

export default contributionsOutsideWorkHours;
