import ReviewTimeByPullRequestSize from "./review-time-by-pull-request-size.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const reviewTimeByPullRequestSize: WidgetConfig = {
    key: 'reviewTimeByPullRequestSize',
    name: 'Review time by pull request size',
    description: () => 'Average time taken to review pull requests, sorted by number of code line changes'
        + ' during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ReviewTimeByPullRequestSize,
}

export default reviewTimeByPullRequestSize;
