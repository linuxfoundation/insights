<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    ref="popover"
    v-model:visibility="isVisible"
    :placement="props.placement"
    v-bind="$attrs"
    :is-modal="pageWidth < 640"
    :match-width="props.matchWidth"
    popover-class="dropdown-popover"
  >
    <slot name="trigger" />

    <template #content>
      <div
        class="c-dropdown overflow-y-auto"
        :style="{ width: props.width }"
        :class="props.dropdownClass"
        @click="popover.closePopover()"
      >
        <slot />
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import type { Placement } from '@popperjs/core';
import { computed, provide } from 'vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import useResponsive from '~/components/shared/utils/responsive';

const props = withDefaults(
  defineProps<{
    placement?: Placement;
    width?: string;
    visibility?: boolean;
    matchWidth?: boolean;
    dropdownClass?: string;
  }>(),
  {
    placement: 'bottom-start',
    width: 'auto',
    visibility: false,
    matchWidth: false,
    dropdownClass: '',
  },
);

const emit = defineEmits<{ (e: 'update:visibility', value: boolean): void }>();

const submenuOpen = ref('');

provide('submenuOpen', submenuOpen);

const isVisible = computed({
  get: () => props.visibility,
  set: (value: boolean) => {
    emit('update:visibility', value);
    submenuOpen.value = '';
  },
});

const popover = ref<LfxPopover | null>(null);

const { pageWidth } = useResponsive();
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown',
};
</script>
