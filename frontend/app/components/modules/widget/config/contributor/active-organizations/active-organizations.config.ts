// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ActiveOrganizations from "./active-organizations.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const activeOrganizations: WidgetConfig = {
    key: 'activeOrganization',
    name: 'Active organizations',
    description: () => 'Organizations that had at least one activity during the selected period, '
        + 'carried out by contributors on their behalf.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ActiveOrganizations,
    share: true,
    embed: false,
    snapshot: false,
}

export default activeOrganizations;
