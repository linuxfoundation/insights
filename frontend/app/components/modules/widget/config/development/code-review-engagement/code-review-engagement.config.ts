// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import CodeReviewEngagement from "./code-review-engagement.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const codeReviewEngagement: WidgetConfig = {
    key: 'codeReviewEngagement',
    name: 'Code review engagement',
    description: () => 'Level of contributors involvement and participation in code review activities during the'
        + ' selected period. Analyze trends to improve engagement.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/development#code-review-engagement`,
    component: CodeReviewEngagement,
    share: true,
    embed: false,
    snapshot: false,
}

export default codeReviewEngagement;
