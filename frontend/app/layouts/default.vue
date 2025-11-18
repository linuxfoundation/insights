<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <main class="min-h-screen flex flex-col pt-14 lg:pt-17">
    <lfx-navbar />
    <div>
      <slot />
    </div>
    <lfx-toast theme="dark" />
    <div class="flex-grow" />
    <lfx-report-global />
    <lfx-share-global />
    <lfx-copilot-global />
    <lfx-insights-footer />
  </main>
</template>

<script setup lang="ts">
import { useRoute, useHead } from 'nuxt/app';
import { watch } from 'vue';
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import LfxInsightsFooter from '~/components/shared/layout/footer.vue';
import LfxReportGlobal from '~/components/shared/modules/report/components/report-global.vue';
import LfxShareGlobal from '~/components/shared/modules/share/components/share-global.vue';
import LfxCopilotGlobal from '~/components/shared/modules/copilot/components/copilot-global.vue';
import { useRichSchema } from '~~/composables/useRichSchema';

const route = useRoute();

// Add sitewide rich schema (JSON-LD) to all pages
const { getSitewideSchema } = useRichSchema();
useHead(getSitewideSchema());

watch(
  () => route.path,
  () => {
    document.body.scrollTo(0, 0);
  },
);
</script>
