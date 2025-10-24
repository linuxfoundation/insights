<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="flex items-center justify-between px-3 py-2 gap-2"
    @click.stop
  >
    <lfx-icon
      name="search"
      :size="16"
      class="text-neutral-400"
    />
    <input
      v-model="model"
      type="text"
      class="!outline-none !shadow-none flex-grow text-sm text-neutral-900 leading-5"
      :placeholder="props.placeholder || 'Search...'"
      @input="changedValue"
    />
    <lfx-icon
      v-if="model.length > 0"
      name="circle-xmark"
      :size="16"
      type="solid"
      class="text-neutral-300 cursor-pointer"
      @click="
        model = '';
        changedValue();
      "
    />
  </label>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  lazy?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const model = ref(props.modelValue);

const debouncedEmit = debounce((value: string) => {
  emit('update:modelValue', value);
}, 300);

const changedValue = () => {
  if (props.lazy) {
    debouncedEmit(model.value);
  } else {
    emit('update:modelValue', model.value);
  }
};
</script>
