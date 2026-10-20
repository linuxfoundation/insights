// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query';
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
  defaultShouldDehydrateQuery,
} from '@tanstack/vue-query';
import type { NuxtApp } from 'nuxt/app';
import { defineNuxtPlugin, useState } from 'nuxt/app';
// Nuxt 3 app aliases

export default defineNuxtPlugin((nuxt: NuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query');

  // 30s staleTime keeps refetchOnWindowFocus/refetchOnMount active in practice —
  // a 5-min window made those no-ops and forced users to hard-refresh to see fresh data.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: 1,
        // Dehydrated error-status queries (see app:rendered hook below) must stay
        // in 'error' state through hydration — TanStack's default retryOnMount:true
        // silently re-fetches any error query with no data the instant a component
        // subscribes to it on mount, discarding the hydrated error and flipping the
        // UI back to its loading skeleton.
        retryOnMount: false,
        // Disable gc timers on the server to prevent orphaned QueryClient instances
        // from being held in memory after SSR completes. Also disable retry on the
        // server: the retry backoff delays settling to 'error' past the app:rendered
        // hook, so a still-pending/retrying query gets dehydrated via TanStack's
        // streaming-promise path instead — which Nuxt's non-streaming SSR here never
        // resolves, leaving the client stuck on the loading state forever.
        ...(import.meta.server ? { gcTime: 0, retry: false } : {}),
      },
    },
  });
  const options: VueQueryPluginOptions = { queryClient };

  nuxt.vueApp.use(VueQueryPlugin, options);

  if (import.meta.server) {
    // Dehydrate synchronously so the payload matches the rendered HTML. Awaiting in-flight queries
    // here hydrates them as settled over markup that was rendered as pending.
    nuxt.hooks.hook('app:rendered', () => {
      // Default dehydration only serializes successful queries, so a query that failed
      // server-side is dropped from the payload and the client never learns it errored —
      // it stays stuck on its initial pending/loading markup. Also dehydrate error queries
      // so the client hydrates straight into the error state.
      const dehydratedState = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'error',
      });

      // Nuxt's payload serializer (devalue) can only stringify plain objects, but
      // query errors are typically class instances (e.g. ofetch's FetchError) whose
      // fields are prototype getters rather than own properties — devalue throws
      // "Cannot stringify arbitrary non-POJOs" on those, crashing the whole SSR
      // response. Reduce each error to a plain object with just the message so the
      // payload always serializes; the UI only checks query status, not error detail.
      dehydratedState.queries.forEach((query) => {
        if (query.state.error instanceof Error) {
          query.state.error = { message: query.state.error.message } as Error;
        }
        if (query.state.fetchFailureReason instanceof Error) {
          query.state.fetchFailureReason = {
            message: query.state.fetchFailureReason.message,
          } as Error;
        }
      });

      vueQueryState.value = dehydratedState;
      queryClient.clear();
    });
  }

  if (import.meta.client && vueQueryState.value) {
    hydrate(queryClient, vueQueryState.value);
  }
});
