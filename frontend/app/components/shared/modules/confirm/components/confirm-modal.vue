<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="25rem"
  >
    <section class="p-6">
      <div class="flex justify-between items-start">
        <h3 class="text-heading-3 font-bold text-neutral-900">
          {{ options.title }}
        </h3>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="handleCancel"
        />
      </div>

      <p class="mt-4 text-body-2 text-neutral-700">
        {{ options.message }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <lfx-button
          type="primary"
          size="small"
          :label="options.confirmLabel"
          @click="handleConfirm"
        />
        <lfx-button
          type="transparent"
          size="small"
          :label="options.cancelLabel"
          @click="handleCancel"
        />
      </div>
    </section>
  </lfx-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import type { ConfirmOptions } from '~/components/shared/modules/confirm/store/confirm.store';

const props = defineProps<{
  modelValue: boolean;
  options: ConfirmOptions;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
    if (!value) {
      emit('cancel');
    }
  },
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<script lang="ts">
export default {
  name: 'LfxConfirmModal',
};
</script>
