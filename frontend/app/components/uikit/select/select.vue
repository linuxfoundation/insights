<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-model="model"
    v-model:visibility="isOpen"
    :match-width="true"
    class="!w-full"
  >
    <template #trigger="{selectedOption}">
      <div class="c-select">
        <div class="flex items-center">
          <slot
            v-if="$slots.prefix"
            name="prefix"
            :selected-option="selectedOption"
          />
          <div>
            <span v-if="selectedOption.label.length > 0">{{selectedOption.label}}</span>
            <span
              v-else
              class="text-neutral-400"
            >{{props.placeholder}}</span>
          </div>
        </div>
        <div class="flex justify-center items-center w-8">
          <lfx-icon
            name="angle-down"
            class="text-neutral-500"
            :size="14"
          />
        </div>
      </div>
    </template>
    <slot />
  </lfx-dropdown-select>
</template>

<script setup lang="ts">
import {computed} from "vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
})
</script>

<script lang="ts">
export default {
  name: 'LfxSelect'
};
</script>
