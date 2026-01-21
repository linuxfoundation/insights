// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

export default defineSitemapEventHandler(async () => {
  const res = await fetchFromTinybird<{ leaderboardType: string }[]>(
    '/v0/pipes/sitemap_leaderboards.json',
    {},
  );
  return res.data.map((item) => ({
    loc: `/leaderboards/${item.leaderboardType}`,
  }));
});
