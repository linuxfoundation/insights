import ContributorLeaderboard from "./contributors-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributorsLeaderboard: WidgetConfig = {
    name: 'Contributors leaderboard',
    description: () => 'Contributor ranking based on the number of activities performed and the impact on the project.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ContributorLeaderboard,
}

export default contributorsLeaderboard;
