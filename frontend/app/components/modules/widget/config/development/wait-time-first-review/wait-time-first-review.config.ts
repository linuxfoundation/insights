import WaitTimeFirstReview from "./wait-time-first-review.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const waitTimeFirstReview: WidgetConfig = {
    name: 'Wait time for 1st review',
    description: () => 'Average time taken between pull request submission and its first '
        + 'review during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: WaitTimeFirstReview,
}

export default waitTimeFirstReview;
