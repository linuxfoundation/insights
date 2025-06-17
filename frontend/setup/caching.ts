// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export default {
    routeRules: {
        "/api/search": { swc: 86400 }, // Cache search results for 1 day
        "/api/**": { swc: 3600 }, // Cache API responses for 1 hour
        "/project/**": { swc: 3600}, // Cache project details for 1 hour
        "**": { swc: 86400 }, // Cache all other routes for 1 day
    },
    nitro: {
        storage: {
            redis: {
                driver: 'redis',
                url: process.env.REDIS_URL,
            },
        },
    },
}
