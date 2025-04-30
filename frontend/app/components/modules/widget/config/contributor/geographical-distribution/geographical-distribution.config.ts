import GeographicalDistribution from "./geographical-distribution.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const geographicalDistribution: WidgetConfig = {
    key: 'geographicalDistribution',
    name: 'Geographical distribution',
    description: () => 'Distribution of contributors and organizations based on geographical'
        + ' location during contributions '
        + 'in the selected period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: GeographicalDistribution,
}

export default geographicalDistribution;
