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
        :invalid="$v.name.$error"
        class="!rounded-full"
      />
      <p
        v-if="$v.name.$error"
        class="text-xs text-negative-500"
      >
        Collection name is required
      </p>
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
        :invalid="$v.description.$error"
        class="h-[72px] !rounded-[20px]"
      />
      <p
        v-if="$v.description.$error"
        class="text-xs text-negative-500"
      >
        Description is required
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
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

const rules = {
  name: { required },
  description: { required },
};

const $v = useVuelidate(rules, model);

defineExpose({ $v });
</script>

<script lang="ts">
export default {
  name: 'LfCreateCollectionStepDetails',
};
</script>
