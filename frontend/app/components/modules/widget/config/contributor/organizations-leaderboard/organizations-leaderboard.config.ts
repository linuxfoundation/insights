// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import OrganizationsLeaderboard from "./organizations-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationsLeaderboard: WidgetConfig = {
    key: 'organizationsLeaderboard',
    name: 'Organizations leaderboard',
    description: () => 'Organization ranking based on the number of activities performed by contributors on'
        + ' their behalf and the impact on the project.',
    learnMoreLink: `/docs/metrics/contributors#organizations-leaderboard`,
    component: OrganizationsLeaderboard,
    share: true,
    embed: false,
    snapshot: false,
}

export default organizationsLeaderboard;
