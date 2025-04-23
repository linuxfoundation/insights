import SocialMentions from "./social-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const socialMentions: WidgetConfig = {
    name: 'Social mentions',
    description: (project) => `Number of times that ${project.name} was mentioned on social platforms during`
        + ` the selected period.`,
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: SocialMentions,
}

export default socialMentions;
