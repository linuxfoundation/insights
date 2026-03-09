// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  ApplicationFailure,
  ChildWorkflowCancellationType,
  ParentClosePolicy,
  continueAsNew,
  executeChild,
  proxyActivities,
  workflowInfo,
} from "@temporalio/workflow";

import * as activities from "../activities";

import { getYesterdayDate } from "../util";
import { ITriggerPackageDownloadsCheckForReposParams } from "../types";
import { savePackageDownloads } from "./savePackageDownloads";

const { fetchUnprocessedReposForDate } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: { maximumAttempts: 3, backoffCoefficient: 3 },
});

export async function triggerDailyPackageDownloads(
  args: ITriggerPackageDownloadsCheckForReposParams,
): Promise<void> {
  const date = getYesterdayDate();
  const LIMIT_REPOS_TO_CHECK_PER_RUN = 50;
  const WAIT_BETWEEN_PROCESSING_REPOS_MS = 800;

  const info = workflowInfo();
  const failedRepoUrls = args?.failedRepoUrls || [];
  let crashedReposCount = 0;

  const repos = await fetchUnprocessedReposForDate(
    date,
    failedRepoUrls,
    LIMIT_REPOS_TO_CHECK_PER_RUN,
  );

  if (repos.length === 0) {
    return;
  }

  // process each repo one by one
  for (const repo of repos) {
    try {
      const result = await executeChild(savePackageDownloads, {
        workflowId: `${info.workflowId}->${repo.repoUrl}`,
        cancellationType: ChildWorkflowCancellationType.ABANDON,
        parentClosePolicy: ParentClosePolicy.PARENT_CLOSE_POLICY_ABANDON,
        retry: {
          maximumAttempts: 5,
          initialInterval: 5000,
          backoffCoefficient: 3,
          maximumInterval: 60000,
        },
        args: [
          {
            repoUrl: repo.repoUrl,
            insightsProjectId: repo.insightsProjectId,
            date,
          },
        ],
      });

      if (!result) {
        failedRepoUrls.push(repo.repoUrl);
      }
    } catch (err) {
      // Child workflow crashed after all retries — track it and move on
      crashedReposCount++;

      // If half or more of the repos in this batch have crashed, stop the workflow
      if (crashedReposCount >= Math.ceil(repos.length / 2)) {
        console.log(
          `Stopping workflow: ${crashedReposCount} out of ${repos.length} repos crashed in this batch.`,
        );
        throw ApplicationFailure.nonRetryable(
          `Too many child workflow crashes (${crashedReposCount}/${repos.length}). Aborting parent workflow.`,
        );
      }
    }

    // wait for a short time to avoid overwhelming the API
    await new Promise((resolve) =>
      setTimeout(resolve, WAIT_BETWEEN_PROCESSING_REPOS_MS),
    );
  }

  if (!args.testRun) {
    await continueAsNew<typeof triggerDailyPackageDownloads>({
      failedRepoUrls,
    });
  }
}
