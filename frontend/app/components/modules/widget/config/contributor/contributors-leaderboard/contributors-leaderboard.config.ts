// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributorLeaderboard from "./contributors-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributorsLeaderboard: WidgetConfig = {
    key: 'contributorsLeaderboard',
    name: 'Contributors leaderboard',
    description: () => 'Contributors ranked by the number of contribution '
        + 'activities performed during the selected time period.',
    learnMoreLink: `/docs/metrics/contributors#contributors-leaderboard`,
    component: ContributorLeaderboard,
    defaultValue: {
        metric: 'all:all'
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default contributorsLeaderboard;
