// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const staticLinks = [
    '/',
    '/introduction/what-is-insights/',
    '/introduction/lf-oss-index/',
    '/introduction/data-sources/',
    '/introduction/data-quality/',
    '/introduction/contributions/',
    '/introduction/maintainers/',
    '/metrics/health-score/',
    '/metrics/contributors/',
    '/metrics/popularity/',
    '/metrics/development/',
    '/metrics/security/',
    '/more/faq/',
    '/more/glossary/',
]

export default defineSitemapEventHandler(async () => {
    return staticLinks.map(item => ({
        loc: `/docs${item}`
    }))
})
