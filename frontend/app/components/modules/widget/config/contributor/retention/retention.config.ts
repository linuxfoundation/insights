import Retention from "./retention.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const retention: WidgetConfig = {
    name: 'Retention',
    description: () => 'Rate at which contributors and organizations continued contributing to '
                 + 'the project during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: Retention,
}

export default retention;
