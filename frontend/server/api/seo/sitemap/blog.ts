// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const staticLinks = [
    '/introducing-insights/',
    '/first-3-months/',
]

export default defineSitemapEventHandler(async () => {
    return staticLinks.map(item => ({
        loc: `/blog${item}`
    }))
})
