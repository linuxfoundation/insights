<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-5">
    <h4 class="font-medium font-primary">
      Latest Press Mentions
    </h4>
    <div class="flex flex-col gap-2">
      <div
        v-for="(mention, index) in list"
        :key="index"
        class="flex flex-row gap-4 items-center rounded-md hover:bg-neutral-50 p-2 cursor-pointer"
      >
        <div
          class="min-w-[72px] h-14 rounded-md overflow-hidden bg-contain"
          :style="{ backgroundImage: `url(${mention.thumbnail})` }"
        />
        <div class="flex flex-col gap-1 grow overflow-hidden">
          <div class="text-xs text-neutral-500 w-full overflow-hidden text-ellipsis">
            {{ mention.source }} - {{ DateTime.fromISO(mention.date).toRelative() }}
          </div>
          <div
            class="w-full truncate text-sm text-neutral-900"
            :title="mention.title"
          >
            {{ mention.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import type { PressMention } from '~~/types/popularity/responses.types';

defineProps<{
  list: PressMention[];
}>();

</script>

<script lang="ts">
export default {
  name: 'LfxProjectPressMentionLists',
}
</script>
