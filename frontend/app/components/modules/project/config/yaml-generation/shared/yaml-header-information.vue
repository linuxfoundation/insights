<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-neutral-900 leading-7">
        Header Information
      </h2>
      <p class="text-xs font-normal text-neutral-500 leading-4">
        Basic information about your project that will appear at the top of the YAML file.
      </p>
    </div>

    <div class="space-y-2">
      <lfx-field label="Project URL">
        <p class="text-xs font-normal text-neutral-500 leading-4 mb-1">
          The main URL where your project can be found (typically GitHub repository URL)
        </p>
        <lfx-input
          v-model="model.header.url"
        />
      </lfx-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxInput from "~/components/uikit/input/input.vue";
import LfxField from "~/components/uikit/field/field.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})
</script>
