// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import OrganizationsLeaderboard from "./organizations-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationsLeaderboard: WidgetConfig = {
    key: 'organizationsLeaderboard',
    name: 'Organizations leaderboard',
    description: () => 'Organizations ranked by the number of contribution activities'
    + 'performed by contributors on their behalf during the selected time period.',
    learnMoreLink: `/docs/metrics/contributors#organizations-leaderboard`,
    component: OrganizationsLeaderboard,
    defaultValue: {
        metric: 'all:all'
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default organizationsLeaderboard;
