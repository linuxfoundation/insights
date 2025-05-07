import CodeReviewEngagement from "./code-review-engagement.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const codeReviewEngagement: WidgetConfig = {
    key: 'codeReviewEngagement',
    name: 'Code review engagement',
    description: () => 'Level of contributors involvement and participation in code review activities during the'
        + ' selected period. Analyze trends to improve engagement.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: CodeReviewEngagement,
    share: true,
    embed: false,
    snapshot: false,
}

export default codeReviewEngagement;
