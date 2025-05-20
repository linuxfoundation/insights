// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import PullRequests from "./pull-requests.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const pullRequests: WidgetConfig = {
    key: 'pullRequests',
    name: 'Pull requests',
    description: () => 'Comparison between opened and merged (or closed) pull requests during the selected period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/development#pull-requests`,
    component: PullRequests,
    share: true,
    embed: false,
    snapshot: false,
}

export default pullRequests;
