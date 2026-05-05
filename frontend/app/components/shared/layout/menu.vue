<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Menu -->
  <div class="items-center gap-4 hidden lg:flex">
    <div class="flex items-center gap-3">
      <lfx-menu-static-links />
    </div>
    <div class="border-r border-neutral-200 h-6" />
  </div>
  <!-- Fixed-width wrapper keeps the search bar layout stable between SSR (empty) and hydrated (button/avatar). -->
  <div class="h-9 min-w-24 flex items-center justify-end shrink-0">
    <client-only>
      <lfx-login />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import LfxMenuStaticLinks from '~/components/shared/layout/menu/static-links.vue';
import LfxLogin from '~/components/modules/auth/components/login.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxMenu',
};
</script>
