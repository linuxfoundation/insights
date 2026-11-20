<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-docs-readiness-correction-modal
    v-if="isCorrectionModalOpen && correctionContext"
    :key="correctionContext.projectSlug"
    :context="correctionContext"
    @close="closeCorrection"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import LfxDocsReadinessCorrectionModal from '~/components/modules/project/components/docs-readiness/correction-modal.vue';
import { useDocsReadinessCorrectionStore } from '~/components/modules/project/store/docs-readiness-correction.store';

const store = useDocsReadinessCorrectionStore();
const { isCorrectionModalOpen, correctionContext } = storeToRefs(store);
const { closeCorrection } = store;
</script>

<script lang="ts">
export default {
  name: 'LfxDocsReadinessCorrectionGlobal',
};
</script>
