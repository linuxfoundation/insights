<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lf-edit-collection-modal
    v-if="isEditModalOpen && editData?.collection"
    v-model="isEditModalOpen"
    :collection="editData.collection"
    @updated="handleUpdated"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import LfEditCollectionModal from './edit-collection-modal.vue';
import { useEditCollectionStore } from '~/components/modules/collection/store/edit-collection.store';

const editCollectionStore = useEditCollectionStore();
const { isEditModalOpen, editData } = storeToRefs(editCollectionStore);
const { handleUpdated } = editCollectionStore;
</script>

<script lang="ts">
export default {
  name: 'LfEditCollectionGlobal',
};
</script>
