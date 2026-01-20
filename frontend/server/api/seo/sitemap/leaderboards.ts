// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import leaderboardConfigs from '~/components/modules/leaderboards/config/index.config';

export default defineSitemapEventHandler(async () => {
  return leaderboardConfigs.map((config) => ({
    loc: `/leaderboards/${config.key}`,
  }));
});
