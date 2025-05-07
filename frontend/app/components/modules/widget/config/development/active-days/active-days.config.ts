import ActiveDays from "./active-days.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const activeDays: WidgetConfig = {
    key: 'activeDays',
    name: 'Active days',
    description: () => 'Number of days contributors were actively involved in the project'
        + ' and the total contributions made'
        + ' during the selected period. This includes commits, pull requests, and more.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ActiveDays,
    share: true,
    embed: false,
    snapshot: false,
}

export default activeDays;
