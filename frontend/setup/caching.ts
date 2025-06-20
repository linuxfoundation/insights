// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export default {
    routeRules: process.env.NODE_ENV === 'development'
        ? {}
        : {
        "/api/health": {cache: false},
        "/api/seo/og-image": {cache: false},
        "/api/report": {cache: false},
        "/api/health/live": {cache: false},
        "/api/search": {cache: {maxAge: 86400, base: 'redis'}}, // Cache search results for 1 day
        "/api/**": {cache: {maxAge: 3600, base: 'redis'}}, // Cache API responses for 1 hour
        "/project/**": {cache: {maxAge: 3600, base: 'redis'}}, // Cache project details for 1 hour
        "**": {cache: {maxAge: 86400, base: 'redis'}}, // Cache all other routes for 1 day
        // "**": {cache: false}, // Cache all other routes for 1 day
        // "/api/search": {swr: 86400}, // Cache search results for 1 day
        // "/api/**": {swr: 3600}, // Cache API responses for 1 hour
        // "/project/**": {swr: 3600}, // Cache project details for 1 hour
        // "**": {swr: 86400}, // Cache all other routes for 1 day
    },
    nitro: {
        storage: {
            redis: {
                driver: 'redis',
                url: process.env.NUXT_REDIS_URL || '',
            },
        },
    },
}
