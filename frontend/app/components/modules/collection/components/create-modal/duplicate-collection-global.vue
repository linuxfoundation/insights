<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lf-create-collection-modal
    v-if="isDuplicateModalOpen && duplicateData?.collection"
    v-model="isDuplicateModalOpen"
    :source-collection="duplicateData.collection"
    @created="handleCreated"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import LfCreateCollectionModal from './create-collection-modal.vue';
import { useDuplicateCollectionStore } from '~/components/modules/collection/store/duplicate-collection.store';

const duplicateCollectionStore = useDuplicateCollectionStore();
const { isDuplicateModalOpen, duplicateData } = storeToRefs(duplicateCollectionStore);
const { handleCreated } = duplicateCollectionStore;
</script>

<script lang="ts">
export default {
  name: 'LfDuplicateCollectionGlobal',
};
</script>
