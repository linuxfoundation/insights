<template>
  <div class="w-full">
    <div
      class="w-full lg:max-w-80 overflow-hidden bg-neutral-50 h-9 border
      border-neutral-200 rounded-full hidden sm:flex items-center gap-2 px-3 cursor-pointer"
      @click="isModalOpen = true"
    >
      <lfx-icon name="search" class="text-neutral-400 font-normal" :size="14" />
      <p class="text-body-1 text-neutral-400 truncate">
        Search projects, repositories...
      </p>
      <div class="flex-grow" />
      <lfx-chip v-if="!isMobile" size="small" type="bordered">
        <template v-if="isMac">
          ⌘+K
        </template>
        <template v-else>
          ⇧+K
        </template>
      </lfx-chip>
    </div>
    <div class="flex sm:!hidden justify-end">
      <lfx-menu-button class="!p-2" @click="isModalOpen = true">
        <lfx-icon name="search" class="font-black text-neutral-400 !h-5 !w-5" :size="18" />
      </lfx-menu-button>
    </div>
  </div>
  <lfx-search-modal v-if="isModalOpen" v-model="isModalOpen" />
</template>

<script setup lang="ts">
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxSearchModal from "~/components/shared/layout/search/search-modal.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxChip from "~/components/uikit/chip/chip.vue";

const isModalOpen = ref(true);
const isMac = ref(false);
const isMobile = ref(false);

const handleKeydown = (event: KeyboardEvent) => {
  if ((isMac.value && event.metaKey && event.key.toLowerCase() === "k")
      || (!isMac.value && event.shiftKey && event.key.toLowerCase() === "k")) {
    event.preventDefault();
    isModalOpen.value = true;
  }
  if(event.code === 'Escape') {
    isModalOpen.value = false;
  }
};

onMounted(() => {
  const userAgent = navigator.userAgent.toLowerCase();
  isMac.value = /macintosh|mac os x/.test(userAgent);
  isMobile.value = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<script lang="ts">
export default {
  name: 'LfxSearch'
}
</script>
