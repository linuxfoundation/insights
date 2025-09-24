// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

const subpages = [
    '',
    '/contributors',
    '/popularity',
    '/development',
    '/security'
]
export default defineSitemapEventHandler(async () => {
    const res = await fetchFromTinybird<{slug: string}[]>('/v0/pipes/sitemap_projects.json', {})
    return res.data.map(item => subpages.map((subpage) => ({
            loc: `/project/${item.slug}${subpage}`
        })
    )).flat();
})
