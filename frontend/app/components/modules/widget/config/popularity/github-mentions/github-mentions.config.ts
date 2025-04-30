import GithubMentions from "./github-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const githubMentions: WidgetConfig = {
    key: 'githubMentions',
    name: 'GitHub Mentions',
    description: (project) => `Number of times that ${project.name} was mentioned on code, files,`
        + ` and paths across GitHub repositories.`,
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: GithubMentions,
}

export default githubMentions;
