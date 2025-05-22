// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import SearchQueries from "./search-queries.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const searchQueries: WidgetConfig = {
    key: 'searchQueries',
    name: 'Search queries',
    description: (project) => `Search interest volume of ${project.name} based on Google Trends.`,
    learnMoreLink: `/docs/metrics/popularity#search-queries`,
    component: SearchQueries,
    share: true,
    embed: false,
    snapshot: true,
}

export default searchQueries;
