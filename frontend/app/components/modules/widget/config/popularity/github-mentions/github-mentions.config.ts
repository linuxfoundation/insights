// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import GithubMentions from "./github-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const githubMentions: WidgetConfig = {
    key: 'githubMentions',
    name: 'GitHub Mentions',
    description: (project) => `Number of times that ${project.name} was mentioned on code, files,`
        + ` and paths across GitHub repositories.`,
    learnMoreLink: `/docs/metrics/popularity#github-mentions`,
    component: GithubMentions,
    defaultValue: {
        activeTab: 'new-mentions',
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default githubMentions;
