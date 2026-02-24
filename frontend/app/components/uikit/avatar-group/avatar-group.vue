<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-avatar-group :class="`type-${props.type}`">
    <slot />
  </pv-avatar-group>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'project' | 'organization' | 'member';
  }>(),
  {
    type: 'member',
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxAvatarGroup',
};
</script>
