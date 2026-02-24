<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link
    v-if="props.to"
    v-slot="{ isActive, isExactActive }"
    v-bind="$attrs"
    :to="props.to"
    class="c-menu-button"
    :active-class="!props.exact ? 'is-active' : undefined"
    :exact-active-class="props.exact ? 'is-active' : undefined"
    :class="{
      'is-active': props.active,
      'is-disabled': props.disabled,
    }"
  >
    <slot :is-active="props.active || (props.exact ? isExactActive : isActive)" />
  </nuxt-link>
  <div
    v-else
    v-bind="$attrs"
    class="c-menu-button"
    :class="{
      'is-active': props.active,
      'is-disabled': props.disabled,
    }"
  >
    <slot :is-active="props.active" />
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router';

const props = withDefaults(
  defineProps<{
    active?: boolean;
    to?: RouteLocationRaw;
    exact?: boolean;
    disabled?: boolean;
  }>(),
  {
    active: false,
    to: undefined,
    exact: false,
    disabled: false,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxMenuButton',
};
</script>
