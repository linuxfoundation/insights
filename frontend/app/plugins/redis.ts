// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
export default defineNitroPlugin((nitroApp: any) => {
    const config = useRuntimeConfig()

    nitroApp.storage.setItem('redis', {
        driver: 'redis',
        url: config.redisUrl,
    })
})
