import SearchQueries from "./search-queries.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const searchQueries: WidgetConfig = {
    key: 'searchQueries',
    name: 'Search queries',
    description: (project) => `Search interest volume of ${project.name} based on Google Trends.`,
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: SearchQueries,
}

export default searchQueries;
