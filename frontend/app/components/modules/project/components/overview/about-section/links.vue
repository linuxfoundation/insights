<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-3 text-xs">
    <div class="text-neutral-400 font-semibold">
      Links
    </div>
    <div class="text-neutral-900 flex flex-col gap-3">
      <div
        v-for="link of links"
        :key="link.name"
        class="flex items-center gap-2"
      >
        <lfx-icon
          v-if="link.icon"
          :name="link.icon"
          :size="14"
        />
        <img
          v-if="link.img"
          :src="link.img"
          class="w-[14px] h-[14px]"
        >
        <a
          :href="link.url"
          target="_blank"
        >
          {{ link.name }}
        </a>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { project } = storeToRefs(useProjectStore())

// add default icon if the backend didn't return them
const links = computed(() => (project.value?.projectLinks || []).map((link) => {
  const icon = link.icon || (link.img ? undefined : 'link')
  return {...link, icon }
}));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
