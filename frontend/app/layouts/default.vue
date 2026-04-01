<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <main
    class="min-h-screen flex flex-col"
    :class="topClass"
  >
    <lfx-navbar />
    <div class="flex-grow pb-30 flex flex-col">
      <slot />
    </div>
    <lfx-toast theme="dark" />
    <lfx-report-global />
    <lfx-share-global />
    <lf-edit-collection-global />
    <lf-duplicate-collection-global />
    <lfx-add-to-collection-global />
    <lfx-copilot-global />
    <lfx-community-filter-global />
    <lfx-confirm-global />
    <lfx-insights-footer />
  </main>
</template>

<script setup lang="ts">
import { useRoute, useHead } from 'nuxt/app';
import { watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import LfxInsightsFooter from '~/components/shared/layout/footer.vue';
import LfxReportGlobal from '~/components/shared/modules/report/components/report-global.vue';
import LfxShareGlobal from '~/components/shared/modules/share/components/share-global.vue';
import LfEditCollectionGlobal from '~/components/modules/collection/components/edit-modal/edit-collection-global.vue';
import LfDuplicateCollectionGlobal from '~/components/modules/collection/components/create-modal/duplicate-collection-global.vue';
import LfxAddToCollectionGlobal from '~/components/modules/collection/components/add-to-collection-modal/add-to-collection-global.vue';
import LfxCopilotGlobal from '~/components/shared/modules/copilot/components/copilot-global.vue';
import LfxCommunityFilterGlobal from '~/components/modules/project/components/community/sections/community-filter-global.vue';
import LfxConfirmGlobal from '~/components/shared/modules/confirm/components/confirm-global.vue';
import { useRichSchema } from '~~/composables/useRichSchema';
import { useBannerStore } from '~/components/shared/store/banner.store';

const route = useRoute();

const { isBannerVisible } = storeToRefs(useBannerStore());
const topClass = computed(() => (isBannerVisible.value ? 'pt-20 sm:pt-21 lg:pt-24' : 'pt-14 lg:pt-17'));

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
