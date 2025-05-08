<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-field-message"
    :class="`c-field-message--${props.type}`"
    v-bind="$attrs"
  >
    <span
      v-if="$slots.icon || iconClass"
      class="c-field-message__icon"
    >
      <slot name="icon">
        <lfx-icon
          v-if="!props.hideIcon"
          :name="iconClass || ''"
          :size="14"
        />
      </slot>
    </span>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {FieldMessageType} from "~/components/uikit/field/types/FieldMessageType";
import {fieldMessageTypeData} from "~/components/uikit/field/constants/fieldMessageTypeData";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = withDefaults(defineProps<{
  type?: FieldMessageType,
  hideIcon?: boolean,
}>(), {
  type: 'error',
  hideIcon: false,
});

const iconClass = computed(() => {
  const { icon } = fieldMessageTypeData[props.type];
  if (icon) {
    return icon;
  }
  return null;
});
</script>

<script lang="ts">
export default {
  name: 'LfxFieldMessage',
};
</script>
