import ActiveOrganizations from "./active-organizations.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const activeOrganizations: WidgetConfig = {
    name: 'Active organizations',
    description: () => 'Organizations that had at least one activity during the selected period, '
        + 'carried out by contributors on their behalf.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ActiveOrganizations,
}

export default activeOrganizations;
