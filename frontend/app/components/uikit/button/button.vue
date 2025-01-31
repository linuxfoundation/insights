<template>
  <pv-button
    :class="`p-button-${props.size} p-button-${props.type}`"
    :label="props.label"
    :icon="props.icon"
    :icon-position="props.iconPosition"
    :loading="props.loading"
    :disabled="props.disabled">
    <slot :loading="props.loading" />
  </pv-button>
</template>

<script setup lang="ts">
import type { ButtonType, ButtonSize, IconPosition } from './types/button.types';

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    type?: ButtonType;
    loading?: boolean;
    size?: ButtonSize;
    iconPosition?: IconPosition;
    disabled?: boolean;
  }>(),
  {
    type: 'primary',
    size: 'medium',
    iconPosition: 'left',
    disabled: false,
    label: '',
    icon: undefined
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxButton'
};
</script>
