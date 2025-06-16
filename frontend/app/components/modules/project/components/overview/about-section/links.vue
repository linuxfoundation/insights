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
import type {
  WebsiteLinkConfig,
  SocialLinkConfig,
  DisplayLinkConfig
} from '~~/app/components/modules/project/config/social-links';
import { socialLinkConfigs, socialLinkOrder } from '~~/app/components/modules/project/config/social-links';

const { project } = storeToRefs(useProjectStore())

const links = computed(() => {
  const processedLinks = (project.value?.projectLinks || []).map((link) => {
    // Handle social media platforms
    const platform = Object.entries(socialLinkConfigs).find(([key, config]) => {
      if (key === 'website') return link.name === (config as WebsiteLinkConfig).name;
      if (key === 'default') return false;

      return (config as SocialLinkConfig).domains?.some((domain) => link.url.includes(domain));
    });

    if (platform) {
      const [_, config] = platform;
      return {
        ...link,
        ...('img' in config && { img: config.img }),
        ...('icon' in config && { icon: config.icon }),
        name: config.transformName ? config.transformName(link.url) : link.url,
        url: config.transformUrl ? config.transformUrl(link.url) : link.url,
        key: config.key
      };
    }

    // Default case
    return {
      ...link,
      ...socialLinkConfigs.default,
    };
  });

  // Sort by platform
  return (processedLinks as DisplayLinkConfig[]).sort((a, b) => {
    const aIndex = socialLinkOrder.indexOf(a.key);
    const bIndex = socialLinkOrder.indexOf(b.key);
    return aIndex - bIndex;
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
