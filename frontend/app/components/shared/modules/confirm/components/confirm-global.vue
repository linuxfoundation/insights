<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-confirm-modal
    v-if="isConfirmModalOpen"
    v-model="isConfirmModalOpen"
    :options="confirmOptions"
    @confirm="confirm"
    @cancel="cancel"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import LfxConfirmModal from '~/components/shared/modules/confirm/components/confirm-modal.vue';
import { useConfirmStore } from '~/components/shared/modules/confirm/store/confirm.store';

const confirmStore = useConfirmStore();
const { isConfirmModalOpen, confirmOptions } = storeToRefs(confirmStore);
const { confirm, cancel } = confirmStore;
</script>

<script lang="ts">
export default {
  name: 'LfxConfirmGlobal',
};
</script>
