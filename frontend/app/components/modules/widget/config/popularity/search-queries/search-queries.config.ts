// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import SearchQueries from './search-queries.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

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
};

export default searchQueries;
