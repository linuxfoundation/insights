// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Config } from "@crowd/archetype-standard";
import { InsightsServiceWorker, Options } from "@insights/temporal-worker";
import { scheduleMonthlySearchVolumeUpdate } from "./schedules/monthlySearchVolumeUpdate";

const config: Config = {
  envvars: [
    'NUXT_TINYBIRD_TOKEN',
    'KEYWORDS_EVERYWHERE_API_KEY'
  ],
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
      enabled: false,
    },
  },
};

export const svc = new InsightsServiceWorker(config, options);

setImmediate(async () => {
  await svc.init();

  await scheduleMonthlySearchVolumeUpdate();

  await svc.start();
});
