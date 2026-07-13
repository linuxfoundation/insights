<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <div class="flex items-center gap-3 overflow-x-auto py-3">
      <lfx-menu-button
        v-for="link of lfCollectionAggregateLinks"
        :key="link.key"
        :to="{ name: link.routeName, params: { slug: props.slug } }"
        :exact="true"
      >
        <lfx-icon :name="link.icon" />
        {{ link.label }}
      </lfx-menu-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import { lfCollectionAggregateLinks } from '~/components/modules/collection/config/collection-links';

const props = defineProps<{
  slug: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionMenu',
};
</script>
