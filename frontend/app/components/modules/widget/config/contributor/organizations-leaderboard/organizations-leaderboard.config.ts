import OrganizationsLeaderboard from "./organizations-leaderboard.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationsLeaderboard: WidgetConfig = {
    key: 'organizationsLeaderboard',
    name: 'Organizations leaderboard',
    description: () => 'Organization ranking based on the number of activities performed by contributors on'
        + ' their behalf and the impact on the project.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: OrganizationsLeaderboard,
    share: true,
    embed: false,
    snapshot: false,
}

export default organizationsLeaderboard;
