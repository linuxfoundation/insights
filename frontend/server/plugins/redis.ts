// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineNitroPlugin } from 'nitropack'
import type { NitroApp } from 'nitropack'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const config = useRuntimeConfig()

    nitroApp.storage.setItem('redis', {
        driver: 'redis',
        url: config.redisUrl,
    })
})
