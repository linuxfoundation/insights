// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  proxyActivities,
} from "@temporalio/workflow";

import * as activities from "../activities/monthlySearchVolumeUpdate";

import { ISearchVolumeParams } from "../search-volume/types";

const { runMonthlySearchVolumeUpdate } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: {
    maximumAttempts: 3,
    initialInterval: 2 * 1000,
    backoffCoefficient: 3
  },
});

export async function monthlySearchVolumeUpdateWorkflow(
  args: ISearchVolumeParams
): Promise<void> {
  await runMonthlySearchVolumeUpdate(args);
}
