// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import ActiveContributors from "./active-contributors.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const activeContributors: WidgetConfig = {
    key: 'activeContributors',
    name: 'Active contributors',
    description: () => 'Active contributor is an individual who performed activities such as commits, issues,'
        + ' or pull requests during the selected time period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/contributors#active-contributors`,
    component: ActiveContributors,
    share: true,
    embed: false,
    snapshot: false,
}

export default activeContributors;
