// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import WaitTimeFirstReview from "./wait-time-first-review.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const waitTimeFirstReview: WidgetConfig = {
    key: 'waitTimeFor1stReview',
    name: 'Wait time for 1st review',
    description: () => 'Average time taken between pull request submission and its first '
        + 'review during the selected period.',
    learnMoreLink: 'https://insights.linuxfoundation.org/docs/metrics/development.html#wait-time-for-first-review',
    component: WaitTimeFirstReview,
    share: true,
    embed: false,
    snapshot: false,
}

export default waitTimeFirstReview;
