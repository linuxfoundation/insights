// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { CommunityConfig } from './types/community.types';
import { githubCommunityConfig } from './github.config';
import { gitCommunityConfig } from './git.config';
import { gerritCommunityConfig } from './gerrit.config';
import { gitlabCommunityConfig } from './gitlab.config';
import { groupsioCommunityConfig } from './groupsio.config';
import { confluenceCommunityConfig } from './confluence.config';
import { jiraCommunityConfig } from './jira.config';
import { devtoCommunityConfig } from './devto.config';
import { discordCommunityConfig } from './discord.config';
import { discourseCommunityConfig } from './discourse.config';
import { hackernewsCommunityConfig } from './hackernews.config';
import { linkedinCommunityConfig } from './linkedin.config';
import { redditCommunityConfig } from './reddit.config';
import { slackCommunityConfig } from './slack.config';
import { stackoverflowCommunityConfig } from './stackoverflow.config';
import { twitterCommunityConfig } from './twitter.config';

export const communityConfigs: Record<string, CommunityConfig> = {
  [githubCommunityConfig.key]: githubCommunityConfig,
  [gitCommunityConfig.key]: gitCommunityConfig,
  [gerritCommunityConfig.key]: gerritCommunityConfig,
  [gitlabCommunityConfig.key]: gitlabCommunityConfig,
  [groupsioCommunityConfig.key]: groupsioCommunityConfig,
  [confluenceCommunityConfig.key]: confluenceCommunityConfig,
  [jiraCommunityConfig.key]: jiraCommunityConfig,
  [devtoCommunityConfig.key]: devtoCommunityConfig,
  [discordCommunityConfig.key]: discordCommunityConfig,
  [discourseCommunityConfig.key]: discourseCommunityConfig,
  [hackernewsCommunityConfig.key]: hackernewsCommunityConfig,
  [linkedinCommunityConfig.key]: linkedinCommunityConfig,
  [redditCommunityConfig.key]: redditCommunityConfig,
  [slackCommunityConfig.key]: slackCommunityConfig,
  [stackoverflowCommunityConfig.key]: stackoverflowCommunityConfig,
  [twitterCommunityConfig.key]: twitterCommunityConfig,
};

export default communityConfigs;
