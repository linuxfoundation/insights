// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  ScheduleAlreadyRunning,
  ScheduleOverlapPolicy,
} from "@temporalio/client";

import { svc } from "../main";
import { triggerDailyPackageDownloads } from "../workflows";

export const scheduleTriggerPackageDownloadsForRepos = async () => {
  try {
    await svc.temporal.schedule.create({
      scheduleId: "scheduleTriggerPackageDownloadsForRepos",
      spec: {
        cronExpressions: ["30 0 * * *"],
      },
      policies: {
        overlap: ScheduleOverlapPolicy.BUFFER_ONE,
        catchupWindow: "1 minute",
      },
      action: {
        type: "startWorkflow",
        workflowType: triggerDailyPackageDownloads,
        taskQueue: "package-downloads",
        retry: {
          initialInterval: "15 seconds",
          backoffCoefficient: 2,
          maximumAttempts: 3,
        },
        args: [
          {
            failedRepoUrls: [],
          },
        ],
      },
    });
  } catch (err) {
    if (err instanceof ScheduleAlreadyRunning) {
      svc.log.info("Schedule already registered in Temporal.");
      svc.log.info(
        "Configuration may have changed since. Please make sure they are in sync.",
      );
    } else {
      throw new Error(err);
    }
  }
};
