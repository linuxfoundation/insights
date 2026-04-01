<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-add-to-collection-modal
    v-if="isModalOpen && modalData?.project"
    v-model="isModalOpen"
    :project="modalData.project"
    @added="handleAdded"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import LfxAddToCollectionModal from './add-to-collection-modal.vue';
import { useAddToCollectionStore } from '~/components/modules/collection/store/add-to-collection.store';

const addToCollectionStore = useAddToCollectionStore();
const { isModalOpen, modalData } = storeToRefs(addToCollectionStore);
const { handleAdded } = addToCollectionStore;
</script>

<script lang="ts">
export default {
  name: 'LfxAddToCollectionGlobal',
};
</script>
