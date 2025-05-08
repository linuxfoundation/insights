// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockTimeseries = {
  meta: [
    {
      name: "id",
      type: "String"
    },
    {
      name: "displayName",
      type: "String"
    },
    {
      name: "contributionPercentage",
      type: "Float64"
    },
    {
      name: "contributionPercentageRunningTotal",
      type: "Float64"
    },
    {
      name: "totalContributorCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      id: "7f65feb0-589b-11ee-bf26-d732180a3416",
      displayName: "Mark Brown",
      contributionPercentage: 2,
      contributionPercentageRunningTotal: 7,
      totalContributorCount: 6754
    },
    {
      id: "a3bbff07-7cec-4885-b688-d8b377a580c6",
      displayName: "Alex Deucher",
      contributionPercentage: 2,
      contributionPercentageRunningTotal: 9,
      totalContributorCount: 6754
    },
    {
      id: "b17e3beb-09e2-447f-a12d-00c716dd00db",
      displayName: "Jakub Kicinski",
      contributionPercentage: 3,
      contributionPercentageRunningTotal: 3,
      totalContributorCount: 6754
    },
    {
      id: "6ac1a927-efc8-4b42-9cd4-683f7ec2e4c8",
      displayName: "Len Brown",
      contributionPercentage: 2,
      contributionPercentageRunningTotal: 5,
      totalContributorCount: 6754
    },
    {
      id: "d47386a6-3890-42c3-8c26-6872a8e38c2c",
      displayName: "Linus Torvalds",
      contributionPercentage: 2,
      contributionPercentageRunningTotal: 11,
      totalContributorCount: 6754
    },
    {
      id: "eb7fc260-77d6-11ef-b115-a7c57b0467ff",
      displayName: "Greg Kroah-Hartman",
      contributionPercentage: 2,
      contributionPercentageRunningTotal: 13,
      totalContributorCount: 6754
    },
    {
      id: "03a88390-f8f7-11ee-9733-23f194e8fceb",
      displayName: "Kent Overstreet",
      contributionPercentage: 1,
      contributionPercentageRunningTotal: 14,
      totalContributorCount: 6754
    },
    {
      id: "e068c75f-716e-4248-b8fa-4e97aaa76fc9",
      displayName: "Christian Brauner",
      contributionPercentage: 1,
      contributionPercentageRunningTotal: 16,
      totalContributorCount: 6754
    },
    {
      id: "7b2a3b66-d42a-442c-99c0-5cdc4f0c5a56",
      displayName: "Krzysztof Kozlowski",
      contributionPercentage: 1,
      contributionPercentageRunningTotal: 15,
      totalContributorCount: 6754
    },
    {
      id: "f215f342-dd22-4f08-b70a-f2cb589b9f41",
      displayName: "Bjorn Andersson",
      contributionPercentage: 1,
      contributionPercentageRunningTotal: 17,
      totalContributorCount: 6754
    }
  ],
  rows: 10,
  rows_before_limit_at_least: 6754,
  statistics: {
    elapsed: 1.899921774,
    rows_read: 2301274,
    bytes_read: 189901864
  }
};
