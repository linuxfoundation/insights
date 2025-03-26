import type { DropdownGroupOptions } from '~/components/uikit/dropdown/types/dropdown.types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';

export const metricsOptions: DropdownGroupOptions[] = [
  {
    label: ActivityPlatforms.GITHUB.valueOf(),
    items: [
      {
        value: ActivityTypes.AUTHORED_COMMIT.valueOf(),
        label: 'Authored a commit'
      },
      {
        value: ActivityTypes.PULL_REQUEST_CLOSED.valueOf(),
        label: 'Closed a pull request'
      },
      {
        value: ActivityTypes.PULL_REQUEST_OPENED.valueOf(),
        label: 'Opened a pull request'
      },
      {
        value: ActivityTypes.PULL_REQUEST_COMMENT.valueOf(),
        label: 'Commented on a pull request'
      },
      {
        value: ActivityTypes.PULL_REQUEST_MERGED.valueOf(),
        label: 'Merged a pull request'
      },
      {
        value: ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED.valueOf(),
        label: 'Requested a review for a pull request'
      },
      {
        value: ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT.valueOf(),
        label: 'Commented on a pull request review thread'
      },
      {
        value: ActivityTypes.ISSUE_CLOSED.valueOf(),
        label: 'Closed an issue'
      },
      {
        value: ActivityTypes.ISSUE_OPENED.valueOf(),
        label: 'Opened an issue'
      },
      {
        value: ActivityTypes.ISSUE_COMMENT.valueOf(),
        label: 'Commented on an issue'
      },

      {
        value: ActivityTypes.DISCUSSION_STARTED.valueOf(),
        label: 'Started a discussion'
      },
      {
        value: ActivityTypes.DISCUSSION_COMMENT.valueOf(),
        label: 'Commented on a discussion'
      }
    ]
  },
  {
    label: ActivityPlatforms.GIT.valueOf(),
    items: [
      {
        value: ActivityTypes.AUTHORED_COMMIT.valueOf(),
        label: 'Authored a commit'
      },
      {
        value: ActivityTypes.REVIEWED_COMMIT.valueOf(),
        label: 'Reviewed a commit'
      },
      {
        value: ActivityTypes.TESTED_COMMIT.valueOf(),
        label: 'Tested a commit'
      },
      {
        value: ActivityTypes.COAUTHORED_COMMIT.valueOf(),
        label: 'Co-authored a commit'
      },
      {
        value: ActivityTypes.INFORMED_COMMIT.valueOf(),
        label: 'Informed a commit'
      },
      {
        value: ActivityTypes.INFLUENCED_COMMIT.valueOf(),
        label: 'Influenced a commit'
      },
      {
        value: ActivityTypes.APPROVED_COMMIT.valueOf(),
        label: 'Approved a commit'
      },
      {
        value: ActivityTypes.COMMITTED_COMMIT.valueOf(),
        label: 'Committed a commit'
      },
      {
        value: ActivityTypes.REPORTED_COMMIT.valueOf(),
        label: 'Reported a commit'
      },
      {
        value: ActivityTypes.RESOLVED_COMMIT.valueOf(),
        label: 'Resolved a commit'
      },
      {
        value: ActivityTypes.SIGNEDOFF_COMMIT.valueOf(),
        label: 'Signed off a commit'
      }
    ]
  },
  {
    label: ActivityPlatforms.GERRIT.valueOf(),
    items: [
      {
        value: ActivityTypes.CHANGESET_NEW.valueOf(),
        label: 'Created a changeset'
      },
      {
        value: ActivityTypes.CHANGESET_CREATED.valueOf(),
        label: 'Created a changeset'
      },
      {
        value: ActivityTypes.CHANGESET_MERGED.valueOf(),
        label: 'Merged a changeset'
      },
      {
        value: ActivityTypes.CHANGESET_CLOSED.valueOf(),
        label: 'Closed a changeset'
      },
      {
        value: ActivityTypes.CHANGESET_ABANDONED.valueOf(),
        label: 'Abandoned a changeset'
      },
      {
        value: ActivityTypes.CHANGESET_COMMENT_CREATED.valueOf(),
        label: 'Created a changeset comment'
      },
      {
        value: ActivityTypes.PATCHSET_CREATED.valueOf(),
        label: 'Created a patchset'
      },
      {
        value: ActivityTypes.PATCHSET_COMMENT_CREATED.valueOf(),
        label: 'Created a patchset comment'
      },
      {
        value: ActivityTypes.PATCHSET_APPROVAL_CREATED.valueOf(),
        label: 'Created a patchset approval'
      }
    ]
  },
  {
    label: ActivityPlatforms.GITLAB.valueOf(),
    items: [
      {
        value: ActivityTypes.ISSUE_OPENED.valueOf(),
        label: 'Opened an issue'
      },
      {
        value: ActivityTypes.ISSUE_CLOSED.valueOf(),
        label: 'Closed an issue'
      },
      {
        value: ActivityTypes.MERGE_REQUEST_CLOSED.valueOf(),
        label: 'Closed a merge request'
      },
      {
        value: ActivityTypes.MERGE_REQUEST_OPENED.valueOf(),
        label: 'Opened a merge request'
      },
      {
        value: ActivityTypes.MERGE_REQUEST_REVIEW_THREAD_COMMENT.valueOf(),
        label: 'Commented on a merge request review thread'
      },
      {
        value: ActivityTypes.MERGE_REQUEST_MERGED.valueOf(),
        label: 'Merged a merge request'
      },
      {
        value: ActivityTypes.MERGE_REQUEST_COMMENT.valueOf(),
        label: 'Commented on a merge request'
      },
      {
        value: ActivityTypes.ISSUE_COMMENT.valueOf(),
        label: 'Commented on an issue'
      },
      {
        value: ActivityTypes.AUTHORED_COMMIT.valueOf(),
        label: 'Authored a commit'
      }
    ]
  },
  {
    label: ActivityPlatforms.GROUPS_IO.valueOf(),
    items: [
      {
        value: ActivityTypes.MESSAGE.valueOf(),
        label: 'Sent a message'
      }
    ]
  },
  {
    label: ActivityPlatforms.CONFLUENCE.valueOf(),
    items: [
      {
        value: ActivityTypes.PAGE_CREATED.valueOf(),
        label: 'Created a page'
      },
      {
        value: ActivityTypes.PAGE_UPDATED.valueOf(),
        label: 'Updated a page'
      },
      {
        value: ActivityTypes.COMMENT_CREATED.valueOf(),
        label: 'Created a comment'
      },
      {
        value: ActivityTypes.ATTACHMENT_CREATED.valueOf(),
        label: 'Created an attachment'
      },
      {
        value: ActivityTypes.BLOGPOST_CREATED.valueOf(),
        label: 'Created a blog post'
      },
      {
        value: ActivityTypes.BLOGPOST_UPDATED.valueOf(),
        label: 'Updated a blog post'
      },
      {
        value: ActivityTypes.ATTACHMENT.valueOf(),
        label: 'Attached a file'
      },
      {
        value: ActivityTypes.COMMENT.valueOf(),
        label: 'Commented on a page'
      }
    ]
  },
  {
    label: ActivityPlatforms.JIRA.valueOf(),
    items: [
      {
        value: ActivityTypes.ISSUE_CREATED.valueOf(),
        label: 'Created an issue'
      },
      {
        value: ActivityTypes.ISSUE_CLOSED.valueOf(),
        label: 'Closed an issue'
      },
      {
        value: ActivityTypes.ISSUE_ASSIGNED.valueOf(),
        label: 'Assigned an issue'
      },
      {
        value: ActivityTypes.ISSUE_UPDATED.valueOf(),
        label: 'Updated an issue'
      },
      {
        value: ActivityTypes.ISSUE_COMMENT_CREATED.valueOf(),
        label: 'Created an issue comment'
      },
      {
        value: ActivityTypes.ISSUE_COMMENT_UPDATED.valueOf(),
        label: 'Updated an issue comment'
      },
      {
        value: ActivityTypes.ISSUE_ATTACHMENT_ADDED.valueOf(),
        label: 'Added an attachment to an issue'
      }
    ]
  },
  {
    label: ActivityPlatforms.DEVTO.valueOf(),
    items: [
      {
        value: ActivityTypes.COMMENT.valueOf(),
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: ActivityPlatforms.DISCORD.valueOf(),
    items: [
      {
        value: ActivityTypes.MESSAGE.valueOf(),
        label: 'Sent a message'
      },
      {
        value: ActivityTypes.THREAD_STARTED.valueOf(),
        label: 'Started a thread'
      },
      {
        value: ActivityTypes.THREAD_MESSAGE.valueOf(),
        label: 'Sent a message in a thread'
      }
    ]
  },
  {
    label: ActivityPlatforms.DISCOURSE.valueOf(),
    items: [
      {
        value: ActivityTypes.CREATE_TOPIC.valueOf(),
        label: 'Created a topic'
      },
      {
        value: ActivityTypes.MESSAGE_IN_TOPIC.valueOf(),
        label: 'Sent a message in a topic'
      }
    ]
  },
  {
    label: ActivityPlatforms.HACKERNEWS.valueOf(),
    items: [
      {
        value: ActivityTypes.POST.valueOf(),
        label: 'Posted a post'
      },
      {
        value: ActivityTypes.COMMENT.valueOf(),
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: ActivityPlatforms.LINKEDIN.valueOf(),
    items: [
      {
        value: ActivityTypes.COMMENT.valueOf(),
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: ActivityPlatforms.REDDIT.valueOf(),
    items: [
      {
        value: ActivityTypes.POST.valueOf(),
        label: 'Posted a post'
      },
      {
        value: ActivityTypes.COMMENT.valueOf(),
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: ActivityPlatforms.SLACK.valueOf(),
    items: [
      {
        value: ActivityTypes.MESSAGE.valueOf(),
        label: 'Sent a message'
      }
    ]
  },
  {
    label: ActivityPlatforms.STACKOVERFLOW.valueOf(),
    items: [
      {
        value: ActivityTypes.QUESTION.valueOf(),
        label: 'Asked a question'
      },
      {
        value: ActivityTypes.ANSWER.valueOf(),
        label: 'Answered a question'
      }
    ]
  },
  {
    label: ActivityPlatforms.TWITTER.valueOf(),
    items: [
      {
        value: ActivityTypes.HASHTAG.valueOf(),
        label: 'Used a hashtag'
      },
      {
        value: ActivityTypes.MENTION.valueOf(),
        label: 'Mentioned a user'
      }
    ]
  }
];

export const activityPlatformsIcons: Record<string, string> = {
  [ActivityPlatforms.GITHUB.toLowerCase()]: '/images/integrations/github.png',
  [ActivityPlatforms.GIT.toLowerCase()]: '/images/integrations/git.png',
  [ActivityPlatforms.GERRIT.toLowerCase()]: '/images/integrations/gerrit.png',
  [ActivityPlatforms.GITLAB.toLowerCase()]: '/images/integrations/gitlab.png',
  [ActivityPlatforms.GROUPS_IO.toLowerCase()]: '/images/integrations/groupsio.svg',
  [ActivityPlatforms.CONFLUENCE.toLowerCase()]: '/images/integrations/confluence.svg',
  [ActivityPlatforms.JIRA.toLowerCase()]: '/images/integrations/jira.png',
  [ActivityPlatforms.DEVTO.toLowerCase()]: '/images/integrations/devto.png',
  [ActivityPlatforms.DISCORD.toLowerCase()]: '/images/integrations/discord.png',
  [ActivityPlatforms.DISCOURSE.toLowerCase()]: '/images/integrations/discourse.png',
  [ActivityPlatforms.HACKERNEWS.toLowerCase()]: '/images/integrations/hackernews.svg',
  [ActivityPlatforms.LINKEDIN.toLowerCase()]: '/images/integrations/linkedin.png',
  [ActivityPlatforms.REDDIT.toLowerCase()]: '/images/integrations/reddit.svg',
  [ActivityPlatforms.SLACK.toLowerCase()]: '/images/integrations/slack.png',
  [ActivityPlatforms.STACKOVERFLOW.toLowerCase()]:
    '/images/integrations/stackoverflow.png',
  [ActivityPlatforms.TWITTER.toLowerCase()]: '/images/integrations/twitter.png'
};
