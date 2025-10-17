<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-menu-button
      class="!p-2"
      @click="isOpen = true"
    >
      <lfx-icon
        name="bars"
        class="font-black text-neutral-400 !h-5 !w-5"
        :size="18"
      />
    </lfx-menu-button>
    <teleport to="body">
      <div
        class="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-black/5 to-black/25 z-[100] transition-all"
        :class="isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'"
        @click="isOpen = false"
      />
      <div
        class="fixed top-0 left-0 h-full w-[350px] bg-white p-5 transition-all transform z-[100]"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <div class="flex flex-col justify-between h-full">
          <div>
            <div class="flex flex-col gap-3 items-start relative">
              <lfx-menu-static-links />
              <lfx-icon-button
                icon="close"
                class="absolute top-0 right-0"
                @click="isOpen = false"
              />
            </div>
          </div>
          <div>
            <div class="my-3 flex justify-start items-center relative">
              <span class="absolute w-full h-[1px] bg-neutral-200" />
              <p class="text-xs font-semibold text-neutral-400 z-10 bg-white pr-4">
                LFX Platform
              </p>
            </div>
            <div class="flex flex-wrap gap-3 pb-8">
              <a
                v-for="(tool, key) in lfxTools"
                :key="key"
                :href="tool.link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <lfx-button
                  class="!rounded-full"
                  type="tertiary"
                  size="small"
                  :icon="`fa-${tool.icon} fa-duotone text-[#00548F]`"
                  :label="tool.name"
                />
              </a>
            </div>
            <a
              :href="lfxMenu.footer.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5"
            >
              <p class="text-xs font-medium text-neutral-500">
                {{ lfxMenu.footer.label }}
              </p>
              <lfx-icon
                name="arrow-up-right"
                class="text-neutral-500"
                :size="14"
              />
            </a>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {lfxMenu} from "../../../../config/menu";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxMenuStaticLinks from "~/components/shared/layout/menu/static-links.vue";
import {lfxTools} from "~/config/menu/tools";
import LfxButton from "~/components/uikit/button/button.vue";

const route = useRoute();

const isOpen = ref(false);

const onEscapeKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false;
  }
};

watch(() => isOpen.value, (show: boolean) => {
  if (!show) {
    window.removeEventListener('keyup', onEscapeKeyUp);
  } else {
    window.addEventListener('keyup', onEscapeKeyUp);
  }
});

watch(() => route.path, () => {
  isOpen.value = false;
});
</script>

<script lang="ts">
  export default {
    name: 'LfxMenuMobile'
  }
</script>
