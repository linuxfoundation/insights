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
      :to="{name: link.route}"
    >
      <lfx-icon
        v-if="link.icon"
        :name="link.icon"
      />
      {{ link.label }}
    </lfx-menu-button>
  </template>

</template>

<script setup lang="ts">
  import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
  import LfxIcon from "~/components/uikit/icon/icon.vue";
  import {lfxMenu} from "~/config/menu";
</script>

<script lang="ts">
  export default {
    name: 'LfxMenuStaticLinks'
  }
</script>
