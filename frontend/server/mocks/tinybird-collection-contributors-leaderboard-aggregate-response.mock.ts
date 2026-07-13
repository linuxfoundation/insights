// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCollectionContributorsLeaderboardAggregate = {
  meta: [
    { name: 'id', type: 'String' },
    { name: 'avatar', type: 'String' },
    { name: 'displayName', type: 'String' },
    { name: 'githubHandleArray', type: 'Array(String)' },
    { name: 'contributionCount', type: 'UInt64' },
  ],
  data: [
    {
      id: 'b17e3beb-09e2-447f-a12d-00c716dd00db',
      avatar: 'https://avatars.githubusercontent.com/u/6732289?v=4',
      displayName: 'Jakub Kicinski',
      githubHandleArray: ['kuba-moo'],
      contributionCount: 9234,
    },
    {
      id: 'a3bbff07-7cec-4885-b688-d8b377a580c6',
      avatar: 'https://avatars.githubusercontent.com/u/118310711?v=4',
      displayName: 'Alex Deucher',
      githubHandleArray: ['alexdeucher'],
      contributionCount: 6625,
    },
    {
      id: 'd47386a6-3890-42c3-8c26-6872a8e38c2c',
      avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      displayName: 'Linus Torvalds',
      githubHandleArray: ['torvalds'],
      contributionCount: 5446,
    },
  ],
  rows: 3,
  rows_before_limit_at_least: 3,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};
