<template>
  <lfx-menu-button
    v-for="link of lfxMenu.links"
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
