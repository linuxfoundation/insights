// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ActiveOrganizations from "./active-organizations.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";
import {Granularity} from "~~/types/shared/granularity";

const activeOrganizations: WidgetConfig = {
    key: 'activeOrganization',
    name: 'Active organizations',
    description: () => 'Organizations that had at least one activity during the selected period, '
        + 'carried out by contributors on their behalf.',
    learnMoreLink: `/docs/metrics/contributors#active-organizations`,
    component: ActiveOrganizations,
    defaultValue: {
        activeTab: Granularity.WEEKLY
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default activeOrganizations;
