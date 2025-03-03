<template>
  <lfx-menu-button
    class="!px-2"
    :class="{'bg-neutral-100 text-neutral-600': isOpen}"
    @click="toggle"
  >
    <lfx-icon
      name="grid-round"
      class="font-black"
    />
  </lfx-menu-button>
  <lfx-popover
    ref="menu"
    v-model:is-open="isOpen"
  >
    <div class="p-3 w-149">
      <div class="flex flex-wrap -m-1.5">
        <div
          v-for="(tool, key) in lfxTools"
          :key="key"
          class="p-1.5 w-1/2 "
        >
          <a
            :href="tool.link"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white hover:bg-neutral-50 transition w-full px-3 py-2.5 flex items-center rounded-md"
          >
            <lfx-icon
              :name="tool.icon"
              type="duotone"
              class="text-[#00548F]"
              :size="24"
            />
            <div class="pl-4">
              <h6 class="text-sm font-semibold mb-0.5 leading-4.5">{{tool.name}}</h6>
              <p class="text-xs text-neutral-500 leading-4">
                {{tool.description}}
              </p>
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
  </lfx-popover>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
  import LfxIcon from "~/components/uikit/icon/icon.vue";
  import LfxPopover from "~/components/uikit/popover/popover.vue";
  import {lfxTools} from "~/config/menu/tools";
  import {lfxMenu} from "~/config/menu";

  const menu = ref();
  const isOpen = ref(false);

  const toggle = (event: MouseEvent) => {
    menu.value.toggle(event);
  };
</script>

<script lang="ts">
  export default {
    name: 'LfxTools'
  }
</script>
