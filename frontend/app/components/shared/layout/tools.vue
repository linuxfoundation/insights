<template>
  <lfx-menu-button class="!px-2" @click="toggle">
    <lfx-icon name="grid-round" class="font-black" />
  </lfx-menu-button>
  <lfx-popover ref="menu">
    <div class="p-10 w-[37.25rem]">
      i am menu
    </div>
  </lfx-popover>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
  import LfxIcon from "~/components/uikit/icon/icon.vue";
  import LfxPopover from "~/components/uikit/popover/popover.vue";

  const menu = ref();

  const toggle = (event: MouseEvent) => {
    menu.value.toggle(event);
  };
</script>

<script lang="ts">
  export default {
    name: 'LfxTools'
  }
</script>
