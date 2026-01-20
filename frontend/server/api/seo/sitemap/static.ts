// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const staticLinks = ['/', '/collection', '/open-source-index', '/leaderboards'];

export default defineSitemapEventHandler(async () => {
  return staticLinks.map((item) => ({
    loc: item,
  }));
});
