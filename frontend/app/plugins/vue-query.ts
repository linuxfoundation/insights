// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {
    DehydratedState,
    VueQueryPluginOptions,
} from '@tanstack/vue-query'
import type { NuxtApp } from 'nuxt/app'
import {defineNuxtPlugin, useState} from 'nuxt/app'
import {
    VueQueryPlugin,
    QueryClient,
    hydrate,
    dehydrate,
} from '@tanstack/vue-query'
// Nuxt 3 app aliases

export default defineNuxtPlugin((nuxt: NuxtApp) => {
    const vueQueryState = useState<DehydratedState | null>('vue-query')

    // Modify your Vue Query global settings here
    const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
    })
    const options: VueQueryPluginOptions = { queryClient }

    nuxt.vueApp.use(VueQueryPlugin, options)

    if (import.meta.server) {
        nuxt.hooks.hook('app:rendered', () => {
            vueQueryState.value = dehydrate(queryClient)
        })
    }

    if (import.meta.client) {
        hydrate(queryClient, vueQueryState.value)
    }
})
