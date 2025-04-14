export enum ActivityTypes {
  ALL = 'all',

  FORKS = 'fork',
  STARS = 'star',
  ISSUES_OPENED = 'issues-opened',
  ISSUES_CLOSED = 'issues-closed',

  PULL_REQUEST_REVIEWED = 'pull_request-reviewed',
  PULL_REQUEST_ASSIGNED = 'pull_request-assigned',
  PULL_REQUEST_COMMENT = 'pull_request-comment',
  PULL_REQUEST_REVIEW_THREAD_COMMENT = 'pull_request-review-thread-comment',
  PULL_REQUEST_REVIEW_REQUESTED = 'pull_request-review-requested',

  // The ones below are for Github
  AUTHORED_COMMIT = 'authored-commit',
  PULL_REQUEST_OPENED = 'pull_request-opened',
  PULL_REQUEST_MERGED = 'pull_request-merged',
  PULL_REQUEST_CLOSED = 'pull_request-closed',
  ISSUE_CLOSED = 'issue-closed',
  ISSUE_OPENED = 'issue-opened',
  ISSUE_COMMENT = 'issue-comment',
  DISCUSSION_STARTED = 'discussion-started',
  DISCUSSION_COMMENT = 'discussion-comment',

  // The ones below are for Git
  REVIEWED_COMMIT = 'reviewed-commit',
  TESTED_COMMIT = 'tested-commit',
  COAUTHORED_COMMIT = 'co-authored-commit',
  INFORMED_COMMIT = 'informed-commit',
  INFLUENCED_COMMIT = 'influenced-commit',
  APPROVED_COMMIT = 'approved-commit',
  COMMITTED_COMMIT = 'committed-commit',
  REPORTED_COMMIT = 'reported-commit',
  RESOLVED_COMMIT = 'resolved-commit',
  SIGNEDOFF_COMMIT = 'signed-off-commit',

  // The ones below are for Gerrit
  CHANGESET_NEW = 'changeset-new',
  CHANGESET_CREATED = 'changeset-created',
  CHANGESET_MERGED = 'changeset-merged',
  CHANGESET_CLOSED = 'changeset-closed',
  CHANGESET_ABANDONED = 'changeset-abandoned',
  CHANGESET_COMMENT_CREATED = 'changeset_comment-created',
  PATCHSET_CREATED = 'patchset-created',
  PATCHSET_COMMENT_CREATED = 'patchset_comment-created',
  PATCHSET_APPROVAL_CREATED = 'patchset_approval-created',

  // The ones below are for Gitlab
  MERGE_REQUEST_CLOSED = 'merge_request-closed',
  MERGE_REQUEST_OPENED = 'merge_request-opened',
  MERGE_REQUEST_REVIEW_THREAD_COMMENT = 'merge_request-review-thread-comment',
  MERGE_REQUEST_MERGED = 'merge_request-merged',
  MERGE_REQUEST_COMMENT = 'merge_request-comment',

  // The ones below are for GroupsIO
  MESSAGE = 'message',

  // The ones below are for Confluence
  PAGE_CREATED = 'page-created',
  PAGE_UPDATED = 'page-updated',
  COMMENT_CREATED = 'comment-created',
  ATTACHMENT_CREATED = 'attachment-created',
  BLOGPOST_CREATED = 'blogpost-created',
  BLOGPOST_UPDATED = 'blogpost-updated',
  ATTACHMENT = 'attachment',
  COMMENT = 'comment',

  // The ones below are for Jira
  ISSUE_CREATED = 'issue-created',
  ISSUE_ASSIGNED = 'issue-assigned',
  ISSUE_UPDATED = 'issue-updated',
  ISSUE_COMMENT_CREATED = 'issue-comment-created',
  ISSUE_COMMENT_UPDATED = 'issue-comment-updated',
  ISSUE_ATTACHMENT_ADDED = 'issue-attachment-added',

  // The ones below are for Discord
  THREAD_STARTED = 'thread-started',
  THREAD_MESSAGE = 'thread-message',

  // The ones below are for Discourse
  CREATE_TOPIC = 'create-topic',
  MESSAGE_IN_TOPIC = 'message-in-topic',

  // The ones below are for Hackernews
  POST = 'post',

  // The ones below are for Stackoverflow
  QUESTION = 'question',
  ANSWER = 'answer',

  // The ones below are for Twitter
  HASHTAG = 'hashtag',
  MENTION = 'mention'
}
