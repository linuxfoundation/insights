// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { proxyActivities } from "@temporalio/workflow";

import * as activities from "../activities";
import { ISavePackageDownloadParams } from "../types";

const { fetchAndSavePackageDownloads } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: {
    maximumAttempts: 5,
    initialInterval: 2 * 1000,
    backoffCoefficient: 1,
  },
});

export async function savePackageDownloads(
  args: ISavePackageDownloadParams
): Promise<void> {
  await fetchAndSavePackageDownloads(
    args.date,
    args.insightsProjectId,
    args.repoUrl
  );
}
