import PullRequests from "./pull-requests.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const pullRequests: WidgetConfig = {
    name: 'Pull requests',
    description: () => 'Comparison between opened and merged (or closed) pull requests during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: PullRequests,
}

export default pullRequests;
