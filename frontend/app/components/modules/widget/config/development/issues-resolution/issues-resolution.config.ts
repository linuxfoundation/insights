import IssuesResolution from "./issues-resolution.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const issuesResolution: WidgetConfig = {
    key: 'issuesResolution',
    name: 'Issues resolution',
    description: () => 'Comparison between total number of issues vs. closed issues during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: IssuesResolution,
    share: true,
    embed: false,
    snapshot: false,
}

export default issuesResolution;
