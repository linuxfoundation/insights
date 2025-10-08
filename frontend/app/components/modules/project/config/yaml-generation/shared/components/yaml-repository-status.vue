<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-select
    v-model="model"
    placeholder="Select status"
    class="!max-w-60"
  >
    <lfx-option
      value="active"
      label="Active"
    />
    <lfx-option
      value="inactive"
      label="Inactive"
    />
    <lfx-option
      value="archived"
      label="Archived"
    />
  </lfx-select>
</template>

<script setup lang="ts">
import LfxSelect from '~/components/uikit/select/select.vue'
import LfxOption from '~/components/uikit/select/option.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const model = computed<string>({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<script lang="ts">
export default {
  name: 'LfxYamlRepositoryStatus',
}
</script>
