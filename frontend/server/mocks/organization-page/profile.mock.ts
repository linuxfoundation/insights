// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const mockOrganizationProfile = {
  meta: [
    { name: 'id', type: 'String' },
    { name: 'displayName', type: 'String' },
    { name: 'logo', type: 'String' },
    { name: 'description', type: 'String' },
    { name: 'domain', type: 'Nullable(String)' },
    { name: 'employeeCount', type: 'Nullable(UInt64)' },
    { name: 'industry', type: 'Nullable(String)' },
    { name: 'website', type: 'Nullable(String)' },
  ],
  data: [
    {
      id: 'google',
      displayName: 'Google',
      logo: 'https://avatars.githubusercontent.com/u/1342004?s=200&v=4',
      description:
        'Google LLC is a global technology leader specializing in internet services, cloud computing, software, and hardware. A major contributor to open source, Google has created and maintains some of the most widely used projects in the world.',
      domain: 'google.com',
      employeeCount: 182000,
      industry: ['Technology', 'Security'],
      website: 'https://about.google',
    },
  ],
};
