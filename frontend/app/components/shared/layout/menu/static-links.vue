<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <template v-for="link of lfxMenu.links">
    <a
      v-if="link.href"
      :key="link.label"
      :href="link.href"
      class="c-menu-button"
      target="_blank"
    >
      <lfx-icon
        v-if="link.icon"
        :name="link.icon"
      />
      {{ link.label }}
    </a>
    <lfx-menu-button
      v-else
      :key="link.label"
      :to="{ name: link.route }"
      :active="isLinkActive(link)"
    >
      <lfx-icon
        v-if="link.icon"
        :name="link.icon"
      />
      {{ link.label }}
    </lfx-menu-button>
  </template>

  <lfx-menu-github-button />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import LfxMenuGithubButton from './github-button.vue';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { lfxMenu, type MenuItem } from '~/config/menu';
import { LfxRoutes } from '~/components/shared/types/routes';

const route = useRoute();

// TODO: This is a temporary workaround to highlight the collections link since we haven't done
// the discovery page yet
const isLinkActive = (link: MenuItem): boolean => {
  if (
    [
      LfxRoutes.COLLECTIONS,
      LfxRoutes.COLLECTIONS_CURATED,
      LfxRoutes.COLLECTIONS_COMMUNITY,
      LfxRoutes.COLLECTIONS_MY_COLLECTIONS,
    ].includes(link.route!)
  ) {
    return route.path.startsWith('/collection');
  }
  return false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxMenuStaticLinks',
};
</script>
