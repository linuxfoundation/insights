<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <main class="min-h-screen flex flex-col pt-14 lg:pt-17">
    <lfx-navbar />
    <div :class="['pb-10', { 'bg-white': route.path === '/explore' }]">
      <slot />
    </div>
    <lfx-toast theme="dark" />
    <div class="flex-grow" />
    <lfx-report-global />
    <lfx-share-global />
    <lfx-welcome-modal />
    <lfx-insights-footer />
  </main>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {watch} from 'vue'
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import LfxReportGlobal from "~/components/shared/modules/report/components/report-global.vue";
import LfxShareGlobal from "~/components/shared/modules/share/components/share-global.vue";
import LfxWelcomeModal from "~/components/shared/components/welcome-modal.vue";
import LfxInsightsFooter from "~/components/shared/layout/footer.vue";

const route = useRoute();

watch(() => route.path, () => {
  document.body.scrollTo(0, 0);
});
</script>
