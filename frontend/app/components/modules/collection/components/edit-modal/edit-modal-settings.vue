<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Collection name field -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium leading-5 text-neutral-900">
          Collection name
          <span class="text-negative-500">*</span>
        </p>
        <lfx-tag
          size="small"
          class="bg-neutral-100 text-neutral-600"
        >
          {{ model.name.length }}/{{ NAME_MAX_LENGTH }}
        </lfx-tag>
      </div>
      <lfx-input
        v-model="model.name"
        :maxlength="NAME_MAX_LENGTH"
        class="!rounded-full"
      />
    </div>

    <!-- Description field -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium leading-5 text-neutral-900">
          Description
          <span class="text-negative-500">*</span>
        </p>
        <lfx-tag
          size="small"
          class="bg-neutral-100 text-neutral-600"
        >
          {{ model.description.length }}/{{ DESCRIPTION_MAX_LENGTH }}
        </lfx-tag>
      </div>
      <lfx-textarea
        v-model="model.description"
        :maxlength="DESCRIPTION_MAX_LENGTH"
        class="h-[72px] !rounded-[20px]"
      />
    </div>

    <!-- Visibility field -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium leading-5 text-neutral-900">Collection visibility:</p>
      <div class="border border-neutral-200 rounded-lg overflow-hidden">
        <!-- Private option -->
        <label class="flex gap-4 items-start p-4 cursor-pointer transition-colors hover:bg-neutral-50">
          <div class="flex items-center py-0.5">
            <lfx-radio
              v-model="model.visibility"
              name="edit-visibility"
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
              name="edit-visibility"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxRadio from '~/components/uikit/radio/radio.vue';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';

const NAME_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;

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
  name: 'LfEditModalSettings',
};
</script>
