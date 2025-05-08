// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/*
https://api.us-west-2.aws.tinybird.co/v0/pipes/contributors_leaderboard.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization */
export const mockTimeseries = {
  meta: [
    {
      name: "id",
      type: "String"
    },
    {
      name: "avatar",
      type: "String"
    },
    {
      name: "displayName",
      type: "String"
    },
    {
      name: "contributionCount",
      type: "UInt64"
    },
    {
      name: "contributionPercentage",
      type: "Float64"
    }
  ],
  data: [
    {
      id: "b17e3beb-09e2-447f-a12d-00c716dd00db",
      avatar: "https://avatars.githubusercontent.com/u/6732289?v=4",
      displayName: "Jakub Kicinski",
      contributionCount: 9234,
      contributionPercentage: 3
    },
    {
      id: "a3bbff07-7cec-4885-b688-d8b377a580c6",
      avatar: "https://avatars.githubusercontent.com/u/118310711?v=4",
      displayName: "Alex Deucher",
      contributionCount: 6625,
      contributionPercentage: 2
    },
    {
      id: "7f65feb0-589b-11ee-bf26-d732180a3416",
      avatar: "https://avatars.githubusercontent.com/u/2903?u=bfd4ef3385bcf27ae093f2bacf99b78dc917018c&v=4",
      displayName: "Mark Brown",
      contributionCount: 5584,
      contributionPercentage: 2
    },
    {
      id: "eb7fc260-77d6-11ef-b115-a7c57b0467ff",
      avatar: "https://secure.gravatar.com/avatar/cbd18395260b6be2575187286a262f9a.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0004-72.png",
      displayName: "Greg Kroah-Hartman",
      contributionCount: 5511,
      contributionPercentage: 2
    },
    {
      id: "d47386a6-3890-42c3-8c26-6872a8e38c2c",
      avatar: "https://avatars.githubusercontent.com/u/1024025?v=4",
      displayName: "Linus Torvalds",
      contributionCount: 5446,
      contributionPercentage: 2
    },
    {
      id: "6ac1a927-efc8-4b42-9cd4-683f7ec2e4c8",
      avatar: "https://s.gravatar.com/avatar/4f4a1afa06be96dc0a4b75b4ae8f3492?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Flb.png",
      displayName: "Len Brown",
      contributionCount: 5364,
      contributionPercentage: 2
    },
    {
      id: "7b2a3b66-d42a-442c-99c0-5cdc4f0c5a56",
      avatar: "https://media.licdn.com/dms/image/v2/C4D03AQFofsfYWL-Gtg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1627292194991?e=1736380800&v=beta&t=gujAz-1ypJh9OSu3ZtzS23n4APf4IJzzwBVwLLgcty4",
      displayName: "Krzysztof Kozlowski",
      contributionCount: 3766,
      contributionPercentage: 1
    },
    {
      id: "03a88390-f8f7-11ee-9733-23f194e8fceb",
      avatar: "https://avatars.githubusercontent.com/u/1993710?v=4",
      displayName: "Kent Overstreet",
      contributionCount: 3344,
      contributionPercentage: 1
    },
    {
      id: "f215f342-dd22-4f08-b70a-f2cb589b9f41",
      avatar: "https://avatars.githubusercontent.com/u/912574?v=4",
      displayName: "Bjorn Andersson",
      contributionCount: 3125,
      contributionPercentage: 1
    },
    {
      id: "f2451180-9920-11ee-8724-bf3a96c0a5bd",
      avatar: "https://media.licdn.com/dms/image/v2/C5603AQFymNPkSZIMFg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1516505180451?e=1736380800&v=beta&t=pLElFMol59TjHGiBzoUCOjiVM5l8kqWV4RGZ07BJ2ys",
      displayName: "Jonathan Cameron",
      contributionCount: 2874,
      contributionPercentage: 1
    }
  ],
  rows: 10,
  rows_before_limit_at_least: 6748,
  statistics: {
    elapsed: 1.813963029,
    rows_read: 1901972,
    bytes_read: 153093428
  }
};

export const mockContributorsLeaderboardCount = {
  meta: [
    {
      name: "count",
      type: "UInt64"
    }
  ],
  data: [
    {
      count: 18
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.10671584,
    rows_read: 12297,
    bytes_read: 1180641
  }
};
