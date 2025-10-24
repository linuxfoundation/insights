<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-dropdown__sub"
    :class="{ 'hidden sm:block': submenuOpen !== '' }"
  >
    <div
      class="c-dropdown__item"
      @click.stop="openMenu()"
    >
      <slot name="item" />
      <div class="flex-grow" />
      <lfx-icon
        name="chevron-right"
        :size="14"
        class="text-neutral-400"
      />
    </div>

    <div
      v-show="isVisible"
      class="c-dropdown__sub-menu c-dropdown relative sm:absolute"
      :style="{ width: props.width }"
    >
      <slot />
    </div>
  </div>
  <div
    v-show="isVisible"
    class="flex sm:hidden flex-col gap-1"
  >
    <div
      class="c-dropdown__item"
      @click.stop="submenuOpen = ''"
    >
      <lfx-icon
        name="chevron-left"
        :size="14"
        class="text-neutral-400"
      />
      {{ props.label }}
    </div>
    <lfx-dropdown-separator />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSeparator from '~/components/uikit/dropdown/dropdown-separator.vue';

const props = defineProps<{
  width?: string;
  name: string;
  label: string;
}>();

// Inject provided submenuOpen from Dropdown
const submenuOpen = inject<ReturnType<typeof computed<string>>>('submenuOpen');

const isVisible = computed(() => submenuOpen && submenuOpen.value === props.name);

const openMenu = () => {
  if (submenuOpen) {
    submenuOpen.value = props.name;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxDropdownSubmenu',
};
</script>
