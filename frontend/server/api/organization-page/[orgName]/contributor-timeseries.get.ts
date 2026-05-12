// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrgContributorTimeseries } from '~~/types/organization-page';
import { mockPrTimeseries } from '~~/server/mocks/organization-page/contributor-timeseries.mock';

export default defineEventHandler(async (): Promise<OrgContributorTimeseries[]> => {
  // TODO: Replace with fetchFromTinybird when real data is available
  return mockPrTimeseries.data;
});
