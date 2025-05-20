// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import ActiveDays from "./active-days.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const activeDays: WidgetConfig = {
    key: 'activeDays',
    name: 'Active days',
    description: () => 'Number of days contributors were actively involved in the project'
        + ' and the total contributions made'
        + ' during the selected period. This includes commits, pull requests, and more.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/development#active-days`,
    component: ActiveDays,
    share: true,
    embed: false,
    snapshot: false,
}

export default activeDays;
