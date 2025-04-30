import Stars from "./stars.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const stars: WidgetConfig = {
    key: 'stars',
    name: 'Stars',
    description: () => 'New stars added to the project repositories during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: Stars,
}

export default stars;
