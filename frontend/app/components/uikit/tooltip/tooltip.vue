<template>
  <div
    class="lfx-tooltip"
    :class="[`lfx-tooltip--${placement}`, props.disabled ? 'lfx-tooltip--disabled' : '']"
  >
    <div
      class="lfx-tooltip__content"
      :class="props.contentClass"
    >
      <slot name="content">
        <div class="lfx-tooltip__content-default-title">
          {{ props.content }}
        </div>
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
// Creating a custom component for tooltip instead of using PrimeVue Tooltip component
// because PrimeVue Tooltip component is not very flexible and does not support all the features we need
import type { TooltipPlacement } from './types/TooltipPlacement';

const props = withDefaults(
  defineProps<{
    placement?: TooltipPlacement;
    content?: string;
    disabled?: boolean;
    contentClass?: string;
  }>(),
  {
    placement: 'top',
    content: '',
    disabled: false,
    contentClass: ''
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxTooltip'
};
</script>
