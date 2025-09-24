// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

export default defineSitemapEventHandler(async () => {
    const res = await fetchFromTinybird<{slug: string}[]>('/v0/pipes/sitemap_category_groups.json', {})
    return res.data.map(item => ({
        loc: `/open-source-index/group/${item.slug}`
    }));
})
