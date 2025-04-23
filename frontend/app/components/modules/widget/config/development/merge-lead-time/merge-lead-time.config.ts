import MergeLeadTime from "./merge-lead-time.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const mergeLeadTime: WidgetConfig = {
    name: 'Merge lead time',
    description: () => 'Average time taken for pull requests to be raised, reviewed, '
        + 'accepted, and merged in the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: MergeLeadTime,
}

export default mergeLeadTime;
