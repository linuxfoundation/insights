<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col items-center justify-center py-10 gap-5 border border-neutral-200 rounded-lg">
    <div class="flex items-center justify-center h-14 w-14 rounded-full bg-accent-100">
      <lfx-icon
        name="rectangle-history"
        :size="32"
        class="text-accent-500"
      />
    </div>
    <div class="flex flex-col items-center justify-center gap-3">
      <h3 class="text-xl font-bold font-secondary leading-8">No collections yet</h3>
      <p class="text-sm text-neutral-600">
        Start building your first collection of open source projects and share it with the community.
      </p>
    </div>
    <lfx-create-collection-button type="ghost" />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCreateCollectionButton from '~/components/modules/collection/components/create-modal/create-button.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionsEmpty',
};
</script>
