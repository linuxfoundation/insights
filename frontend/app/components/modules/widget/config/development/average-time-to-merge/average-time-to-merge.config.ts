import AverageTimeToMerge from "./average-time-to-merge.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const averateTimeToMerge: WidgetConfig = {
    name: 'Average time to merge',
    description: () => 'Average time taken for pull requests to be merged during the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: AverageTimeToMerge,
}

export default averateTimeToMerge;
