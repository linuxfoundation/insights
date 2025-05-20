// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import ContributorLeaderboard from "./contributors-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const contributorsLeaderboard: WidgetConfig = {
    key: 'contributorsLeaderboard',
    name: 'Contributors leaderboard',
    description: () => 'Contributor ranking based on the number of activities performed and the impact on the project.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/contributors#contributors-leaderboard`,
    component: ContributorLeaderboard,
    share: true,
    embed: false,
    snapshot: false,
}

export default contributorsLeaderboard;
