// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://api.us-west-2.aws.tinybird.co/v0/pipes/contributors_geo_distribution.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization
export const mockContributorsGeoDistTimeseries = {
  meta: [
    {
      name: "country",
      type: "String"
    },
    {
      name: "flag",
      type: "String"
    },
    {
      name: "country_code",
      type: "String"
    },
    {
      name: "contributorCount",
      type: "UInt64"
    },
    {
      name: "contributorPercentage",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      country: "Unknown",
      flag: "❓",
      country_code: "XX",
      contributorCount: 6799,
      contributorPercentage: 100
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.127064772,
    rows_read: 3713607,
    bytes_read: 265895834
  }
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/organizations_geo_distribution.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization
export const mockOrganizationsGeoDistTimeseries = {
  meta: [
    {
      name: "country",
      type: "String"
    },
    {
      name: "flag",
      type: "String"
    },
    {
      name: "country_code",
      type: "String"
    },
    {
      name: "organizationCount",
      type: "UInt64"
    },
    {
      name: "organizationPercentage",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      country: "Unknown",
      flag: "❓",
      country_code: "XX",
      organizationCount: 559,
      organizationPercentage: 59
    },
    {
      country: "United States",
      flag: "🇺🇸",
      country_code: "US",
      organizationCount: 133,
      organizationPercentage: 14
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      country_code: "DE",
      organizationCount: 38,
      organizationPercentage: 4
    },
    {
      country: "China",
      flag: "🇨🇳",
      country_code: "CN",
      organizationCount: 30,
      organizationPercentage: 3
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      country_code: "GB",
      organizationCount: 18,
      organizationPercentage: 2
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      country_code: "CA",
      organizationCount: 14,
      organizationPercentage: 1
    },
    {
      country: "France",
      flag: "🇫🇷",
      country_code: "FR",
      organizationCount: 13,
      organizationPercentage: 1
    },
    {
      country: "India",
      flag: "🇮🇳",
      country_code: "IN",
      organizationCount: 12,
      organizationPercentage: 1
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      country_code: "AU",
      organizationCount: 11,
      organizationPercentage: 1
    },
    {
      country: "Switzerland",
      flag: "🇨🇭",
      country_code: "CH",
      organizationCount: 11,
      organizationPercentage: 1
    },
    {
      country: "Russia",
      flag: "🇷🇺",
      country_code: "RU",
      organizationCount: 9,
      organizationPercentage: 1
    },
    {
      country: "Poland",
      flag: "🇵🇱",
      country_code: "PL",
      organizationCount: 8,
      organizationPercentage: 1
    },
    {
      country: "Netherlands",
      flag: "🇳🇱",
      country_code: "NL",
      organizationCount: 8,
      organizationPercentage: 1
    },
    {
      country: "Japan",
      flag: "🇯🇵",
      country_code: "JP",
      organizationCount: 8,
      organizationPercentage: 1
    },
    {
      country: "Israel",
      flag: "🇮🇱",
      country_code: "IL",
      organizationCount: 8,
      organizationPercentage: 1
    },
    {
      country: "Belgium",
      flag: "🇧🇪",
      country_code: "BE",
      organizationCount: 5,
      organizationPercentage: 1
    },
    {
      country: "Singapore",
      flag: "🇸🇬",
      country_code: "SG",
      organizationCount: 4,
      organizationPercentage: 0
    },
    {
      country: "Brazil",
      flag: "🇧🇷",
      country_code: "BR",
      organizationCount: 4,
      organizationPercentage: 0
    },
    {
      country: "Sweden",
      flag: "🇸🇪",
      country_code: "SE",
      organizationCount: 4,
      organizationPercentage: 0
    },
    {
      country: "Spain",
      flag: "🇪🇸",
      country_code: "ES",
      organizationCount: 4,
      organizationPercentage: 0
    },
    {
      country: "Italy",
      flag: "🇮🇹",
      country_code: "IT",
      organizationCount: 3,
      organizationPercentage: 0
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      country_code: "MY",
      organizationCount: 2,
      organizationPercentage: 0
    },
    {
      country: "Mexico",
      flag: "🇲🇽",
      country_code: "MX",
      organizationCount: 2,
      organizationPercentage: 0
    },
    {
      country: "Austria",
      flag: "🇦🇹",
      country_code: "AT",
      organizationCount: 2,
      organizationPercentage: 0
    },
    {
      country: "Romania",
      flag: "🇷🇴",
      country_code: "RO",
      organizationCount: 2,
      organizationPercentage: 0
    },
    {
      country: "Czech Republic",
      flag: "🇨🇿",
      country_code: "CZ",
      organizationCount: 2,
      organizationPercentage: 0
    },
    {
      country: "Ukraine",
      flag: "🇺🇦",
      country_code: "UA",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Turkey",
      flag: "🇹🇷",
      country_code: "TR",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Argentina",
      flag: "🇦🇷",
      country_code: "AR",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Denmark",
      flag: "🇩🇰",
      country_code: "DK",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Ireland",
      flag: "🇮🇪",
      country_code: "IE",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Egypt",
      flag: "🇪🇬",
      country_code: "EG",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "South Korea",
      flag: "🇰🇷",
      country_code: "KR",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Portugal",
      flag: "🇵🇹",
      country_code: "PT",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Thailand",
      flag: "🇹🇭",
      country_code: "TH",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "United Arab Emirates",
      flag: "🇦🇪",
      country_code: "AE",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Saudi Arabia",
      flag: "🇸🇦",
      country_code: "SA",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Indonesia",
      flag: "🇮🇩",
      country_code: "ID",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Croatia",
      flag: "🇭🇷",
      country_code: "HR",
      organizationCount: 1,
      organizationPercentage: 0
    },
    {
      country: "Bulgaria",
      flag: "🇧🇬",
      country_code: "BG",
      organizationCount: 1,
      organizationPercentage: 0
    }
  ],
  rows: 40,
  statistics: {
    elapsed: 0.089086432,
    rows_read: 1296835,
    bytes_read: 99501985
  }
};
