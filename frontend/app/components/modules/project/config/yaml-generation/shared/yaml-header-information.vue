<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <lfx-tag
        size="small"
        variation="neutral"
      >
        Project settings
      </lfx-tag>
      <h2 class="text-lg font-semibold text-neutral-900 leading-7">
        Header Information
      </h2>
      <p class="text-xs font-normal text-neutral-500 leading-4">
        Basic information about your project that will appear at the top of the YAML file.
      </p>
    </div>

    <div class="space-y-2">
      <lfx-field
        label="Project URL"
        required
      >
        <lfx-input
          v-model="model.header.url"
        />
        <template #description>
          The name of your project as you want it to appear in the YAML file.
        </template>
      </lfx-field>
      <p class="text-xs font-normal text-neutral-500 leading-4">
        The main URL where your project can be found (typically GitHub repository URL)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxInput from "~/components/uikit/input/input.vue";
import LfxField from "~/components/uikit/field/field.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})
</script>
