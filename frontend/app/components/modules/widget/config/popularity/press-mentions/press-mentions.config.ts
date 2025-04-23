import PressMentions from "./press-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const pressMentions: WidgetConfig = {
    name: 'Press mentions',
    description: (project) => `Number of times that ${project.name} was mentioned in news and articles during`
        + ` the selected period.`,
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: PressMentions,
}

export default pressMentions;
