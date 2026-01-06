<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-filter-platform
    v-model="platform"
    :available-platforms="['gerrit']"
  />
</template>

<script lang="ts" setup>
import LfxWidgetFilterPlatform from '~/components/modules/widget/components/shared/filter/filter-platform.vue';

const props = defineProps<{
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void;
}>();

const platform = computed({
  get: () => props.modelValue.platform ?? false,
  set: (value: boolean) => {
    emit('update:modelValue', {
      ...props.modelValue,
      platform: value,
    });
  },
});
</script>
