<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Project details
      </p>
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Documentation
      </h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Project resources regarding set up, policies, and processes that support proper usage and contribution.
      </p>
    </div>

    <!-- Form Fields -->
    <lfx-field label="Quickstart guide URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Beginner-friendly setup or installation guide
      </p>
      <lfx-input
        v-model="model.documentation['quickstart-guide']"
        placeholder=""
      />
    </lfx-field>

    <lfx-field label="Detailed guide URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Full project documentation or reference manual
      </p>
      <lfx-input
        v-model="model.documentation['detailed-guide']"
        placeholder=""
      />
    </lfx-field>

    <lfx-field label="Code of conduct URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Rules on behavior and community participation
      </p>
      <lfx-input
        v-model="model.documentation['code-of-conduct']"
        placeholder=""
      />
    </lfx-field>

    <lfx-field label="Release process URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Releases planning, approval, and publishing processes
      </p>
      <lfx-input
        v-model="model.documentation['release-process']"
        placeholder=""
      />
    </lfx-field>

    <lfx-field label="Support policy URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Project support guidelines and assistance
      </p>
      <lfx-input
        v-model="model.documentation['support-policy']"
        placeholder=""
      />
    </lfx-field>

    <lfx-field label="Signature verification URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Instructions for verifying signed releases or artifacts
      </p>
      <lfx-input
        v-model="model.documentation['signature-verification']"
        placeholder=""
      />
    </lfx-field>
  </div>
</template>

<script setup lang="ts">
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})
</script>
