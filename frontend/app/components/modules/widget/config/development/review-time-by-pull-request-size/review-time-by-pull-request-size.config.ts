// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ReviewTimeByPullRequestSize from "./review-time-by-pull-request-size.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const reviewTimeByPullRequestSize: WidgetConfig = {
    key: 'reviewTimeByPullRequestSize',
    name: 'Review time by pull request size',
    description: () => 'Average time taken to review pull requests, sorted by number of code line changes'
        + ' during the selected period.',
    learnMoreLink: `/docs/metrics/development#review-time-by-pull-request-size`,
    component: ReviewTimeByPullRequestSize,
    share: true,
    embed: true,
    snapshot: true,
    copilot: {
        icon: 'code-pull-request',
        suggestions: 'How long does it take to review a pull request?'
    },
}

export default reviewTimeByPullRequestSize;
