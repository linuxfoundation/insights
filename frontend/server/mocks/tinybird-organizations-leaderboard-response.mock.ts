// https://api.us-west-2.aws.tinybird.co/v0/pipes/organizations_leaderboard.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization
export const mockTimeseries = {
  meta: [
    {
      name: "id",
      type: "String"
    },
    {
      name: "logo",
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
      id: "d7bf07d9-780b-4279-bfbc-d83f85950353",
      logo: "https://lf-master-organization-logos-prod.s3.us-east-2.amazonaws.com/red-hat,-inc..svg",
      displayName: "Red Hat, Inc.",
      contributionCount: 16593,
      contributionPercentage: 12
    },
    {
      id: "9f7f73b0-95d6-49c2-bffe-8300c03852ef",
      logo: "https://lf-platform-documents-prod.s3.amazonaws.com/linaro_limited_1716406752779_0014100000Te22QAAR.svg",
      displayName: "Linaro Limited",
      contributionCount: 13560,
      contributionPercentage: 10
    },
    {
      id: "0c562f29-ab29-4383-b4ca-85457367ee39",
      logo: "https://lf-master-organization-logos-prod.s3.us-east-2.amazonaws.com/arm-limited.svg",
      displayName: "Arm Limited",
      contributionCount: 9996,
      contributionPercentage: 7
    },
    {
      id: "987a49ec-31c9-4611-a5f0-a0ce52a999b2",
      logo: "https://lf-platform-documents-prod.s3.amazonaws.com/SUSE_Logo-hor_L_Green-pos_sRGB.svg",
      displayName: "SUSE",
      contributionCount: 9168,
      contributionPercentage: 7
    },
    {
      id: "543dd100-3a92-4a9d-ba5a-d629f452681a",
      logo: "https://lf-master-organization-logos-prod.s3.us-east-2.amazonaws.com/advanced-micro-devices,-inc..svg",
      displayName: "Advanced Micro Devices (AMD)",
      contributionCount: 8484,
      contributionPercentage: 6
    },
    {
      id: "51fde723-67df-4e0e-91c6-936d01d59559",
      logo: "https://avatars.githubusercontent.com/u/38015056?v=4",
      displayName: "The Linux Foundation",
      contributionCount: 7308,
      contributionPercentage: 5
    },
    {
      id: "522278e4-d0dc-4ddb-a7bc-739253b760cf",
      logo: "https://lf-master-organization-logos-prod.s3.us-east-2.amazonaws.com/qualcomm-inc.svg",
      displayName: "Qualcomm, Inc.",
      contributionCount: 4061,
      contributionPercentage: 3
    },
    {
      id: "f4c82974-4298-496d-8d69-bbc3761f97c6",
      logo: "https://lf-master-organization-logos-prod.s3.us-east-2.amazonaws.com/huawei-technologies-co-ltd.svg",
      displayName: "Huawei Technologies Co., Ltd",
      contributionCount: 3004,
      contributionPercentage: 2
    },
    {
      id: "5264d0aa-93d5-4899-a22b-c00085ee41a5",
      logo: "",
      displayName: "Individual - No Account",
      contributionCount: 2709,
      contributionPercentage: 2
    },
    {
      id: "3e9107f1-26dc-4159-bae5-b08d4854ee66",
      logo: "https://avatars.githubusercontent.com/u/8340675?v=4",
      displayName: "self-employed",
      contributionCount: 2666,
      contributionPercentage: 2
    }
  ],
  rows: 10,
  rows_before_limit_at_least: 916,
  statistics: {
    elapsed: 0.60122696,
    rows_read: 948278,
    bytes_read: 106430097
  }
};

export const mockOrganizationsLeaderboardCount = {
  meta: [
    {
      name: "count",
      type: "UInt64"
    }
  ],
  data: [
    {
      count: 21
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.10671584,
    rows_read: 12297,
    bytes_read: 1180641
  }
};
