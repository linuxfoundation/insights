// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributorLeaderboard from "./contributors-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributorsLeaderboard: WidgetConfig = {
    key: 'contributorsLeaderboard',
    name: 'Contributors leaderboard',
    description: () => 'Contributor ranking based on the number of activities performed and the impact on the project.',
    learnMoreLink: `/docs/metrics/contributors#contributors-leaderboard`,
    component: ContributorLeaderboard,
    defaultValue: {
        metric: 'all:all'
    },
    share: true,
    embed: false,
    snapshot: true,
}

export default contributorsLeaderboard;
