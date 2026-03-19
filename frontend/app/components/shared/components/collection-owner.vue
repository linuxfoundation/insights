<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-avatar
    v-if="props.collection.owner && props.collection.owner.logo"
    :src="props.collection.owner.logo"
    type="member"
    size="small"
  />
  <template v-else>
    <img
      :src="owner.logo"
      :alt="owner.name"
      class="block"
      loading="lazy"
      :width="size === 'small' ? 12 : 16"
      :height="size === 'small' ? 12 : 16"
    />
  </template>
  <span
    class="text-neutral-600"
    :class="{ 'text-xs': size === 'small', 'text-sm': size === 'default' }"
  >
    {{ owner.name }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Collection } from '~~/types/collection';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';

const props = withDefaults(
  defineProps<{
    collection: Collection;
    size?: 'small' | 'default';
    byPrefix?: string;
  }>(),
  {
    byPrefix: '',
    size: 'default',
  },
);

const owner = computed(() => {
  if (props.collection.owner) {
    return {
      name: `by ${props.collection.owner?.name}`,
      logo: props.collection.owner?.logo,
    };
  }

  return {
    name: `${props.byPrefix}by The Linux Foundation`,
    logo: lfIconUrl,
  };
});
</script>
