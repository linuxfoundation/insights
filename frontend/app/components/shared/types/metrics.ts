import type { DropdownOption } from '~/components/uikit/dropdown/types/dropdown.types';

export const metricsOptions: DropdownOption[] = [
  { label: 'All activities', value: 'all' },
  { label: 'Commits', value: 'commits' },
  { label: 'Issues Opened', value: 'issues-opened' },
  { label: 'Issues Closed', value: 'issues-closed' },
  { label: 'Pull Requests Opened', value: 'pull-requests-opened' },
  { label: 'Pull Requests Closed', value: 'pull-requests-closed' },
  { label: 'Pull Requests Merged', value: 'pull-requests-merged' },
  { label: 'Pull Requests Reviews', value: 'pull-requests-reviews' },
  { label: 'Pull Requests Comments', value: 'pull-requests-comments' }
];
