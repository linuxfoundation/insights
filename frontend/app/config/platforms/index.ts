import { github } from './configs/github.platform';
import { git } from './configs/git.platform';
import { gerrit } from './configs/gerrit.platform';
import { gitlab } from './configs/gitlab.platform';
import { groupsio } from './configs/groupsio.platform';
import { confluence } from './configs/confluence.platform';
import { jira } from './configs/jira.platform';
import { devto } from './configs/devto.platform';
import { discord } from './configs/discord.platform';
import { discourse } from './configs/discourse.platform';
import { hackernews } from './configs/hackernews.platform';
import { linkedin } from './configs/linkedin.platform';
import { reddit } from './configs/reddit.platform';
import { slack } from './configs/slack.platform';
import { stackoverflow } from './configs/stackoverflow.platform';
import { twitter } from './configs/twitter.platform';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const platforms: Record<string, PlatformConfig> = {
  github,
  git,
  gerrit,
  gitlab,
  groupsio,
  confluence,
  jira,
  devto,
  discord,
  discourse,
  hackernews,
  linkedin,
  reddit,
  slack,
  stackoverflow,
  twitter
};
