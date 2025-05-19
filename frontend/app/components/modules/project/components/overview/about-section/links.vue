<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-3 text-xs">
    <div class="text-neutral-400 font-semibold">
      Links
    </div>
    <div
      v-if="links.length"
      class="text-neutral-900 flex flex-col gap-3"
    >
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
    <div
      v-else
      class="text-xs text-neutral-900"
    >No links available</div>
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
  if (link.url.includes('x') || link.url.includes('twitter')) {
    return {
      ...link,
      img: '/images/integrations/x.png',
      name: link.url?.replace("https://x.com", "").replace("https://twitter.com", "")
    }
  }

  if (link.url.includes('linkedin')) {
    return {
      ...link,
      img: '/images/integrations/linkedin.png',
      name: link.url?.replace("https://www.linkedin.com", "")
    }
  }

  if (link.url.includes('github')) {
    return {
      ...link,
      img: '/images/integrations/github.png',
      name: link.url?.replace("https://github.com", "")
    }
  }

  return {...link, icon }
}));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
