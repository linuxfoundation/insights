import Forks from "./forks.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const forks: WidgetConfig = {
    name: 'Forks',
    description: () => 'New forks (copies) of the project repositories during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: Forks,
}

export default forks;
