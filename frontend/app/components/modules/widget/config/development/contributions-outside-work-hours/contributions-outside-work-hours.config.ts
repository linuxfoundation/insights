// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributionsOutsideWorkHours from "./contributions-outside-work-hours.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributionsOutsideWorkHours: WidgetConfig = {
    key: 'contributionsOutsideWorkHours',
    name: 'Contributions outside work hours',
    description: () => 'Contributors’ activity patterns focused on contributions performed during non-business hours '
                 + 'and weekends during the selected period.',
    learnMoreLink: `/docs/metrics/development#contributions-outside-work-hours`,
    component: ContributionsOutsideWorkHours,
    share: true,
    embed: false,
    snapshot: false,
}

export default contributionsOutsideWorkHours;
