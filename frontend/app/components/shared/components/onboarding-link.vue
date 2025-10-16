<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-row gap-4 items-center rounded-full"
    :class="{
      'py-1.5 pl-4 pr-2 bg-brand-50': showMessage
    }"
  >
    <span
      v-if="showMessage"
      class="text-xs text-brand-600 font-semibold"
    >
      Looking for a project that’s not listed?
    </span>
    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <lfx-button
        type="tertiary"
        button-style="pill"
        size="small"
      >
        <lfx-icon
          name="grid-round-2-plus"
          :size="16"
        />
        Submit project
      </lfx-button>
    </a>
  </div>
</template>
<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';

defineProps<{
  showMessage?: boolean;
}>();

const href = 'https://github.com/linuxfoundation/insights/discussions/categories/' +
 'project-onboardings?discussions_q=is:open+category:%22Project+onboardings%22+sort:top'
</script>

<script lang="ts">
export default {
  name: 'LfxWelcomeModal',
}
</script>
