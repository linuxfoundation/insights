import OrganizationsDependency from "./organization-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationDependency: WidgetConfig = {
    key: 'organizationDependency',
    name: 'Organizations dependency',
    description: () => 'Distribution of contributions across different organizations, '
        + 'whose contributors were actively involved in the project during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: OrganizationsDependency,
}

export default organizationDependency;
