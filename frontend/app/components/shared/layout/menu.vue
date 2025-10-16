<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Menu -->
  <div class="items-center gap-4 hidden lg:flex">
    <div class="flex items-center gap-3 ">
      <lfx-menu-static-links />
    </div>
    <div class="border-r border-neutral-200 h-6" />
  </div>
  <client-only>
    <lfx-login />
  </client-only>
</template>

<script setup lang="ts">
  import LfxMenuStaticLinks from "~/components/shared/layout/menu/static-links.vue";
  import LfxLogin from "~/components/modules/auth/components/login.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxMenu'
  }
</script>
