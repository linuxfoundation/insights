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
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { project } = storeToRefs(useProjectStore())

// TODO: remove this once we have the links from the API
const links = project.value?.projectLinks || [
  {
    name: 'kubernetes.io',
    url: 'https://kubernetes.io/',
    icon: 'link'
  },
  {
    name: 'kubernetes.io',
    url: 'https://twitter.com/kubernetes',
    img: '/images/integrations/twitter.png'
  },
  {
    name: '/kubernetes',
    url: 'https://linkedin.com/company/kubernetes',
    img: '/images/integrations/linkedin.png'
  }

];
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
