import ActiveContributors from "./active-contributors.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const activeContributors: WidgetConfig = {
    name: 'Active contributors',
    description: () => 'Active contributor is an individual who performed activities such as commits, issues,'
        + ' or pull requests during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ActiveContributors,
}

export default activeContributors;
