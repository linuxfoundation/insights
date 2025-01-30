<template>
  <div class="lfx-tooltip" :class="[`lfx-tooltip--${placement}`, props.disabled ? 'lfx-tooltip--disabled' : '']">
    <div class="lfx-tooltip__content" :class="props.contentClass">
      <slot name="content">
        {{ props.content }}
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
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
