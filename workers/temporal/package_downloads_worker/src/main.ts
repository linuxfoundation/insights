// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Config } from "@crowd/archetype-standard";
import { InsightsServiceWorker, Options } from "@insights/temporal-worker";
import { scheduleTriggerPackageDownloadsForRepos } from "./schedules/scheduleTriggeringDailyPackageDownloads";

const config: Config = {
  envvars: [],
  producer: {
    enabled: false,
  },
  temporal: {
    enabled: true,
  },
  questdb: {
    enabled: false,
  },
  redis: {
    enabled: false,
  },
};

const options: Options = {
  postgres: {
    insights: {
      enabled: true,
    },
    cm: {
      enabled: true,
    },
  },
};

export const svc = new InsightsServiceWorker(config, options);

setImmediate(async () => {
  await svc.init();

  await scheduleTriggerPackageDownloadsForRepos();

  await svc.start();
});
