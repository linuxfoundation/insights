<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <p class="text-xs font-medium leading-4 text-neutral-900">Collection visibility:</p>
    <div class="border border-neutral-200 rounded-lg overflow-hidden">
      <!-- Private option -->
      <label class="flex gap-4 items-start p-4 cursor-pointer transition-colors hover:bg-neutral-50">
        <div class="flex items-center py-0.5">
          <lfx-radio
            v-model="model.visibility"
            name="visibility"
            value="private"
          />
        </div>
        <div class="flex flex-col flex-1">
          <p class="text-sm font-medium leading-5 text-neutral-900">Private</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">Only you can see this collection.</p>
        </div>
      </label>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- Public option -->
      <label class="flex gap-4 items-start p-4 cursor-pointer transition-colors hover:bg-neutral-50">
        <div class="flex items-center py-0.5">
          <lfx-radio
            v-model="model.visibility"
            name="visibility"
            value="public"
          />
        </div>
        <div class="flex flex-col flex-1">
          <p class="text-sm font-medium leading-5 text-neutral-900">Public</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Featured on Community Collections, available to everyone.
          </p>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxRadio from '~/components/uikit/radio/radio.vue';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';

const props = defineProps<{
  modelValue: CreateCollectionForm;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: CreateCollectionForm): void }>();

const model = computed<CreateCollectionForm>({
  get: () => props.modelValue,
  set: (value: CreateCollectionForm) => emit('update:modelValue', value),
});
</script>

<script lang="ts">
export default {
  name: 'LfCreateCollectionStepVisibility',
};
</script>
