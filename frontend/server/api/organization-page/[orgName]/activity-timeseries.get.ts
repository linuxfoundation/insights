// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrgActivityTimeseries } from '~~/types/organization-page';
import { mockCommitTimeseries } from '~~/server/mocks/organization-page/activity-timeseries.mock';

export default defineEventHandler(async (): Promise<OrgActivityTimeseries[]> => {
  // TODO: Replace with fetchFromTinybird when real data is available
  return mockCommitTimeseries.data;
});
