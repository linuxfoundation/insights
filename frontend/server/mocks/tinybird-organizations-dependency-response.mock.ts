// https://api.us-west-2.aws.tinybird.co/v0/pipes/organization_dependency.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization

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
      name: "totalOrganizationCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      id: "d7bf07d9-780b-4279-bfbc-d83f85950353",
      displayName: "Red Hat, Inc.",
      contributionPercentage: 13,
      contributionPercentageRunningTotal: 13,
      totalOrganizationCount: 952
    },
    {
      id: "9f7f73b0-95d6-49c2-bffe-8300c03852ef",
      displayName: "Linaro Limited",
      contributionPercentage: 10,
      contributionPercentageRunningTotal: 23,
      totalOrganizationCount: 952
    },
    {
      id: "0c562f29-ab29-4383-b4ca-85457367ee39",
      displayName: "Arm Limited",
      contributionPercentage: 7,
      contributionPercentageRunningTotal: 30,
      totalOrganizationCount: 952
    },
    {
      id: "987a49ec-31c9-4611-a5f0-a0ce52a999b2",
      displayName: "SUSE",
      contributionPercentage: 7,
      contributionPercentageRunningTotal: 37,
      totalOrganizationCount: 952
    },
    {
      id: "543dd100-3a92-4a9d-ba5a-d629f452681a",
      displayName: "Advanced Micro Devices (AMD)",
      contributionPercentage: 6,
      contributionPercentageRunningTotal: 43,
      totalOrganizationCount: 952
    },
    {
      id: "51fde723-67df-4e0e-91c6-936d01d59559",
      displayName: "The Linux Foundation",
      contributionPercentage: 5,
      contributionPercentageRunningTotal: 48,
      totalOrganizationCount: 952
    },
    {
      id: "522278e4-d0dc-4ddb-a7bc-739253b760cf",
      displayName: "Qualcomm, Inc.",
      contributionPercentage: 3,
      contributionPercentageRunningTotal: 51,
      totalOrganizationCount: 952
    }
  ],
  rows: 7,
  rows_before_limit_at_least: 926,
  statistics: {
    elapsed: 0.840925162,
    rows_read: 1345215,
    bytes_read: 140177381
  }
};
