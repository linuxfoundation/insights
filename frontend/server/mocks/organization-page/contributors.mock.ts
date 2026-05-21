// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const mockOrganizationContributors = {
  meta: [
    { name: 'id', type: 'String' },
    { name: 'name', type: 'String' },
    { name: 'avatar', type: 'String' },
    { name: 'contributions', type: 'UInt64' },
    { name: 'roles', type: 'Array(String)' },
  ],
  data: [
    {
      id: 'contrib-1',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
      contributions: 2845,
      roles: ['Maintainer', 'Reviewer'],
    },
    {
      id: 'contrib-2',
      name: 'James Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=james-rodriguez',
      contributions: 2310,
      roles: ['Maintainer'],
    },
    {
      id: 'contrib-3',
      name: 'Priya Patel',
      avatar: 'https://i.pravatar.cc/150?u=priya-patel',
      contributions: 1890,
      roles: ['Contributor', 'Reviewer'],
    },
    {
      id: 'contrib-4',
      name: 'Michael Kim',
      avatar: 'https://i.pravatar.cc/150?u=michael-kim',
      contributions: 1654,
      roles: ['Contributor'],
    },
    {
      id: 'contrib-5',
      name: 'Elena Vasquez',
      avatar: 'https://i.pravatar.cc/150?u=elena-vasquez',
      contributions: 1420,
      roles: ['Maintainer', 'Reviewer'],
    },
    {
      id: 'contrib-6',
      name: 'David Okonkwo',
      avatar: 'https://i.pravatar.cc/150?u=david-okonkwo',
      contributions: 1280,
      roles: ['Contributor'],
    },
    {
      id: 'contrib-7',
      name: 'Anna Müller',
      avatar: 'https://i.pravatar.cc/150?u=anna-muller',
      contributions: 1150,
      roles: ['Reviewer'],
    },
    {
      id: 'contrib-8',
      name: 'Raj Sharma',
      avatar: 'https://i.pravatar.cc/150?u=raj-sharma',
      contributions: 980,
      roles: ['Contributor'],
    },
    {
      id: 'contrib-9',
      name: 'Lisa Thompson',
      avatar: 'https://i.pravatar.cc/150?u=lisa-thompson',
      contributions: 870,
      roles: ['Contributor', 'Reviewer'],
    },
    {
      id: 'contrib-10',
      name: 'Yuki Tanaka',
      avatar: 'https://i.pravatar.cc/150?u=yuki-tanaka',
      contributions: 745,
      roles: ['Contributor'],
    },
  ],
};
