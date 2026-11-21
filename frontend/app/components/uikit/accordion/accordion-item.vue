<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article class="c-accordion__item">
    <div
      class="flex cursor-pointer select-none gap-4 items-center"
      :class="{ 'flex-row-reverse': props.reverse }"
      role="button"
      tabindex="0"
      :aria-expanded="!!isOpen"
      @click="toggle()"
      @keydown.enter.self.prevent="toggle()"
      @keydown.space.self.prevent="toggle()"
    >
      <div class="flex-grow min-w-0">
        <slot />
      </div>

      <lfx-icon
        name="angle-down"
        :size="16"
        class="transition-all shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>
    <div
      v-if="isOpen"
      :class="{ 'pl-8': props.reverse }"
    >
      <slot name="content" />
    </div>
  </article>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  name: string;
  reverse?: boolean;
}>();

const selectedValue = inject('selectedItem');

const isOpen = computed(() => selectedValue && selectedValue.value === props.name);

const toggle = () => {
  if (selectedValue === undefined) return;
  if (isOpen.value) {
    selectedValue.value = '';
  } else {
    selectedValue.value = props.name;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxAccordionItem',
};
</script>
