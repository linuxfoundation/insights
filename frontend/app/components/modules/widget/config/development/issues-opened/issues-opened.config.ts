// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import IssuesOpened from "./issues-opened.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const issuesOpened: WidgetConfig = {
    key: 'issuesOpened',
    name: 'Issues opened',
    description: () => 'Number of issues opened during the selected time period.',
    learnMoreLink: `/docs/metrics/development#issues-opened`,
    component: IssuesOpened,
    share: true,
    embed: true,
    snapshot: true,
}

export default issuesOpened; 