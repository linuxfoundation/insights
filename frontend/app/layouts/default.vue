<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <main class="min-h-screen flex flex-col pt-28 sm:pt-21 lg:pt-24">
    <lfx-navbar />
    <div :class="['pb-10']">
      <slot />
    </div>
    <lfx-toast theme="dark" />
    <div class="flex-grow" />
    <ClientOnly>
      <lfx-report-global />
      <lfx-share-global />
      <lfx-copilot-global />
      <lfx-welcome-modal />
    </ClientOnly>
    <lfx-insights-footer />
  </main>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {watch, defineAsyncComponent} from 'vue'
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import LfxInsightsFooter from "~/components/shared/layout/footer.vue";

// Lazy load modal components - they're not needed for initial render
const LfxReportGlobal = defineAsyncComponent(
  () => import("~/components/shared/modules/report/components/report-global.vue")
);
const LfxShareGlobal = defineAsyncComponent(
  () => import("~/components/shared/modules/share/components/share-global.vue")
);
const LfxCopilotGlobal = defineAsyncComponent(
  () => import("~/components/shared/modules/copilot/components/copilot-global.vue")
);
const LfxWelcomeModal = defineAsyncComponent(
  () => import("~/components/shared/components/welcome-modal.vue")
);

const route = useRoute();

watch(() => route.path, () => {
  document.body.scrollTo(0, 0);
});
</script>
