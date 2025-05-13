<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <main class="min-h-screen flex flex-col pt-14 lg:pt-17">
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
    <div class="flex-grow" />
    <div class="container">
      <client-only>
        <lfx-footer class="pt-10 md:pt-16 pb-5 md:pb-8 px-0" />
      </client-only>
    </div>
    <lfx-report-global />
    <lfx-share-global />
  </main>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {watch} from 'vue'
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import LfxReportGlobal from "~/components/shared/modules/report/components/report-global.vue";
import LfxShareGlobal from "~/components/shared/modules/share/components/share-global.vue";
// Only import the UI core library on the client side
if (import.meta.client) {
  await import('@linuxfoundation/lfx-ui-core');
}

const route = useRoute();

watch(() => route.path, () => {
  document.body.scrollTo(0, 0);
});
</script>

<style lang="scss" scoped>
.copyright {
  color: #808b91;
  a{
    color: #5b6367;

    &:hover{
      @apply underline;
    }
  }
}
</style>
