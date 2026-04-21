<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col items-center justify-center py-12 md:py-14 px-6 gap-5 border border-neutral-200 rounded-lg text-center"
  >
    <div class="flex items-center justify-center h-14 w-14 rounded-full bg-accent-100">
      <lfx-icon
        name="rectangle-history"
        :size="32"
        class="text-accent-500"
      />
    </div>
    <div class="flex flex-col items-center justify-center gap-2 md:gap-3">
      <h3 class="text-lg md:text-xl font-bold font-secondary leading-7 md:leading-8">No collections yet</h3>
      <p class="text-sm text-neutral-600 max-w-md">
        Start building your first collection of open source projects and share it with the community.
      </p>
    </div>
    <lfx-create-collection-button
      type="transparent"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCreateCollectionButton from '~/components/modules/collection/components/create-modal/create-button.vue';

const emit = defineEmits<{
  created: [];
}>();

const handleCreated = () => {
  emit('created');
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionsEmpty',
};
</script>
