<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-popover
      v-model:visibility="isOpen"
      placement="bottom-end"
    >
      <lfx-menu-button
        class="!p-2"
      >
        <lfx-icon
          name="bars"
          class="font-black text-neutral-400 !h-5 !w-5"
          :size="18"
        />
      </lfx-menu-button>

      <template #content>
        <div class="bg-white shadow-lg rounded-lg border border-neutral-200">
          <div class="p-3 w-80">
            <div class="flex flex-col gap-3 items-start">
              <lfx-menu-static-links />
            </div>
            <div>
              <div class="my-3 flex justify-center items-center relative">
                <span class="absolute w-full h-[1px] bg-neutral-200" />
                <p class="text-xs font-semibold text-neutral-400 z-10 bg-white px-4">
                  LFX Platform
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <a
                  v-for="(tool, key) in lfxTools"
                  :key="key"
                  :href="tool.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bg-white hover:bg-neutral-50 transition w-full px-3 py-2 flex items-center rounded-md"
                >
                  <lfx-icon
                    :name="tool.icon"
                    type="duotone"
                    class="text-[#00548F]"
                    :size="16"
                  />
                  <div class="pl-3">
                    <h6 class="text-xs font-medium leading-5">{{tool.name}}</h6>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div class="py-2 px-3 bg-neutral-100 flex justify-center">
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
      </template>
    </lfx-popover>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {useRoute} from 'vue-router';
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import {lfxTools} from "~/config/menu/tools";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxMenuStaticLinks from "~/components/shared/layout/menu/static-links.vue";
import {lfxMenu} from "~/config/menu";

const route = useRoute();

const isOpen = ref(false);

watch(() => route.path, () => {
  isOpen.value = false;
});

</script>

<script lang="ts">
  export default {
    name: 'LfxMenuTablet'
  }
</script>
