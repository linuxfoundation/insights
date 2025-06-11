<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-icon-button"
    :class="[
      `c-icon-button--${props.size}`,
      `c-icon-button--${props.type}`,
      {'is-disabled': props.disabled}
    ]"
  >
    <slot>
      <lfx-icon :name="props.icon" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";
import type {IconButtonSize, IconButtonType} from "~/components/uikit/icon-button/types/icon-button.types";

const props = withDefaults(
  defineProps<{
    icon: string;
    type?: IconButtonType;
    size?: IconButtonSize;
    disabled?: boolean;
  }>(),
  {
    type: 'default',
    size: 'medium',
    disabled: false
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxIconButton'
};
</script>
