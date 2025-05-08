<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-for="error of errors.slice(0, 1)"
    :key="error.$property"
  >
    <lfx-field-message
      v-if="errorMessage(error)"
      v-bind="$attrs"
    >
      {{ errorMessage(error) }}
      <template
        v-if="$slots.icon"
        #icon
      >
        <slot name="icon" />
      </template>
    </lfx-field-message>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxFieldMessage from "~/components/uikit/field/field-message.vue";

const props = withDefaults(defineProps<{
  validation: object,
  errorMessages?: Record<string, string>
}>(), {
  errorMessages: () => ({}),
});

const errors = computed(() => (props.validation?.$errors || []));

const errorMessage = (error: object) => {
  const prop = error.$validator;
  if (
    props.errorMessages
      && props.errorMessages[prop] !== undefined
  ) {
    return props.errorMessages[prop];
  }
  if (!props.hideDefault) {
    return error.$message;
  }
  return '';
};
</script>

<script lang="ts">
export default {
  name: 'LfxFieldMessages',
};
</script>
