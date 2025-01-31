<template>
  <pv-button
    :class="`p-button-${props.size} p-button-${props.type}`"
    :label="props.label"
    :icon="props.icon"
    :icon-position="props.iconPosition"
    :disabled="props.disabled">
    <i v-if="props.loading" class="fa-sharp fa-light fa-spinner-third animate-spin" />
    <slot v-else />
  </pv-button>
</template>

<script setup lang="ts">
import type { ButtonType, ButtonSize, IconPosition } from './types/ButtonType';

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
    disabled: false
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxButton'
};
</script>
