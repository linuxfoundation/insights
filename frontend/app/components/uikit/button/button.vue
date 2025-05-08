<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-button
    v-bind="$attrs"
    :class="`p-button-${props.size} p-button-${props.type} p-button-${props.buttonStyle}`"
    :label="props.label"
    :icon="props.icon"
    :icon-position="props.iconPosition"
    :loading="props.loading"
    :disabled="props.disabled"
  >
    <slot />
  </pv-button>
</template>

<script setup lang="ts">
import type {
  ButtonStyle, ButtonType, ButtonSize, IconPosition
} from './types/button.types';

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    type?: ButtonType;
    buttonStyle?: ButtonStyle;
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
    icon: undefined,
    buttonStyle: 'rounded'
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxButton'
};
</script>
