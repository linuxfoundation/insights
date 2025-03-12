import type { DropdownGroupOptions } from '~/components/uikit/dropdown/types/dropdown.types';

export const metricsOptions: DropdownGroupOptions[] = [
  { label: '', items: [{ label: 'All activities', value: 'all' }] },
  {
    label: 'Github',
    items: [
      {
        value: 'authored-commit',
        label: 'Authored a commit'
      },
      {
        value: 'pull_request-closed',
        label: 'Closed a pull request'
      },
      {
        value: 'pull_request-opened',
        label: 'Opened a pull request'
      },
      {
        value: 'pull_request-comment',
        label: 'Commented on a pull request'
      },
      {
        value: 'pull_request-merged',
        label: 'Merged a pull request'
      },
      {
        value: 'pull_request-review-requested',
        label: 'Requested a review for a pull request'
      },
      {
        value: 'pull_request-review-thread-comment',
        label: 'Commented on a pull request review thread'
      },
      {
        value: 'issue-closed',
        label: 'Closed an issue'
      },
      {
        value: 'issue-opened',
        label: 'Opened an issue'
      },
      {
        value: 'issue-comment',
        label: 'Commented on an issue'
      },

      {
        value: 'discussion-started',
        label: 'Started a discussion'
      },
      {
        value: 'discussion-comment',
        label: 'Commented on a discussion'
      }
    ]
  },
  {
    label: 'Git',
    items: [
      {
        value: 'authored-commit',
        label: 'Authored a commit'
      },
      {
        value: 'reviewed-commit',
        label: 'Reviewed a commit'
      },
      {
        value: 'tested-commit',
        label: 'Tested a commit'
      },
      {
        value: 'co-authored-commit',
        label: 'Co-authored a commit'
      },
      {
        value: 'informed-commit',
        label: 'Informed a commit'
      },
      {
        value: 'influenced-commit',
        label: 'Influenced a commit'
      },
      {
        value: 'approved-commit',
        label: 'Approved a commit'
      },
      {
        value: 'committed-commit',
        label: 'Committed a commit'
      },
      {
        value: 'reported-commit',
        label: 'Reported a commit'
      },
      {
        value: 'resolved-commit',
        label: 'Resolved a commit'
      },
      {
        value: 'signed-off-commit',
        label: 'Signed off a commit'
      }
    ]
  },
  {
    label: 'Gerrit',
    items: [
      {
        value: 'changeset-new',
        label: 'Created a changeset'
      },
      {
        value: 'changeset-created',
        label: 'Created a changeset'
      },
      {
        value: 'changeset-merged',
        label: 'Merged a changeset'
      },
      {
        value: 'changeset-closed',
        label: 'Closed a changeset'
      },
      {
        value: 'changeset-abandoned',
        label: 'Abandoned a changeset'
      },
      {
        value: 'changeset_comment-created',
        label: 'Created a changeset comment'
      },
      {
        value: 'patchset-created',
        label: 'Created a patchset'
      },
      {
        value: 'patchset_comment-created',
        label: 'Created a patchset comment'
      },
      {
        value: 'patchset_approval-created',
        label: 'Created a patchset approval'
      }
    ]
  },
  {
    label: 'Gitlab',
    items: [
      {
        value: 'issue-opened',
        label: 'Opened an issue'
      },
      {
        value: 'issue-closed',
        label: 'Closed an issue'
      },
      {
        value: 'merge_request-closed',
        label: 'Closed a merge request'
      },
      {
        value: 'merge_request-opened',
        label: 'Opened a merge request'
      },
      {
        value: 'merge_request-review-thread-comment',
        label: 'Commented on a merge request review thread'
      },
      {
        value: 'merge_request-merged',
        label: 'Merged a merge request'
      },
      {
        value: 'merge_request-comment',
        label: 'Commented on a merge request'
      },
      {
        value: 'issue-comment',
        label: 'Commented on an issue'
      },
      {
        value: 'authored-commit',
        label: 'Authored a commit'
      }
    ]
  },
  {
    label: 'GroupsIO',
    items: [
      {
        value: 'message',
        label: 'Sent a message'
      }
    ]
  },
  {
    label: 'Confluence',
    items: [
      {
        value: 'page-created',
        label: 'Created a page'
      },
      {
        value: 'page-updated',
        label: 'Updated a page'
      },
      {
        value: 'comment-created',
        label: 'Created a comment'
      },
      {
        value: 'attachment-created',
        label: 'Created an attachment'
      },
      {
        value: 'blogpost-created',
        label: 'Created a blog post'
      },
      {
        value: 'blogpost-updated',
        label: 'Updated a blog post'
      },
      {
        value: 'attachment',
        label: 'Attached a file'
      },
      {
        value: 'comment',
        label: 'Commented on a page'
      }
    ]
  },
  {
    label: 'Jira',
    items: [
      {
        value: 'issue-created',
        label: 'Created an issue'
      },
      {
        value: 'issue-closed',
        label: 'Closed an issue'
      },
      {
        value: 'issue-assigned',
        label: 'Assigned an issue'
      },
      {
        value: 'issue-updated',
        label: 'Updated an issue'
      },
      {
        value: 'issue-comment-created',
        label: 'Created an issue comment'
      },
      {
        value: 'issue-comment-updated',
        label: 'Updated an issue comment'
      },
      {
        value: 'issue-attachment-added',
        label: 'Added an attachment to an issue'
      }
    ]
  },
  {
    label: 'Devto',
    items: [
      {
        value: 'comment',
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: 'Discord',
    items: [
      {
        value: 'message',
        label: 'Sent a message'
      },
      {
        value: 'thread-started',
        label: 'Started a thread'
      },
      {
        value: 'thread-message',
        label: 'Sent a message in a thread'
      }
    ]
  },
  {
    label: 'Discourse',
    items: [
      {
        value: 'create-topic',
        label: 'Created a topic'
      },
      {
        value: 'message-in-topic',
        label: 'Sent a message in a topic'
      }
    ]
  },
  {
    label: 'Hackernews',
    items: [
      {
        value: 'post',
        label: 'Posted a post'
      },
      {
        value: 'comment',
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: 'Linkedin',
    items: [
      {
        value: 'comment',
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: 'Reddit',
    items: [
      {
        value: 'post',
        label: 'Posted a post'
      },
      {
        value: 'comment',
        label: 'Commented on a post'
      }
    ]
  },
  {
    label: 'Slack',
    items: [
      {
        value: 'message',
        label: 'Sent a message'
      }
    ]
  },
  {
    label: 'Stackoverflow',
    items: [
      {
        value: 'question',
        label: 'Asked a question'
      },
      {
        value: 'answer',
        label: 'Answered a question'
      }
    ]
  },
  {
    label: 'Twitter',
    items: [
      {
        value: 'hashtag',
        label: 'Used a hashtag'
      },
      {
        value: 'mention',
        label: 'Mentioned a user'
      }
    ]
  }
];
