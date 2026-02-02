<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown
    placement="bottom-end"
    width="320px"
  >
    <template #trigger>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
      >
        <lfx-icon
          name="arrow-down-to-line"
          :size="16"
        />
        <span>Download (PNG)</span>
      </button>
    </template>

    <!-- Achievement Card Option -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors"
      @click="downloadCard"
    >
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-neutral-900">Achievement card</span>
        <span class="text-xs text-neutral-500">800x320px · PNG</span>
      </div>
      <!-- Card Preview Icon -->
      <div class="w-[93px] h-[49px] border border-dashed border-neutral-400 rounded-lg flex items-center p-2">
        <div class="flex flex-col gap-1 flex-1">
          <div class="h-[3px] w-[41px] bg-neutral-200 rounded-sm" />
          <div class="h-[3px] w-[63px] bg-neutral-200 rounded-sm" />
          <div class="h-[3px] w-[49px] bg-neutral-200 rounded-sm" />
        </div>
        <div class="size-[18px] bg-neutral-200 rounded-full" />
      </div>
    </div>

    <!-- Achievement Badge Option -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors"
      @click="downloadBadge"
    >
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-neutral-900">Achievement badge</span>
        <span class="text-xs text-neutral-500">400x400px · PNG</span>
      </div>
      <!-- Badge Preview Icon -->
      <div class="size-12 border border-dashed border-neutral-400 rounded-full" />
    </div>
  </lfx-dropdown>

  <!-- Hidden render target for badge (400x400px) -->
  <div class="fixed -left-[9999px] -top-[9999px] pointer-events-none">
    <div
      ref="badgeRenderRef"
      class="w-[400px] h-[400px] bg-white relative"
    >
      <!-- Project Logo in top-right corner -->
      <div
        class="absolute top-4 right-4 size-20 bg-white border border-neutral-200 rounded-[20px] flex items-center justify-center"
      >
        <lfx-avatar
          :src="project?.logo"
          size="large"
          type="organization"
          class="rounded-[16px]"
        />
      </div>

      <!-- Large dashed circle with badge icon -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div :class="['size-80 rounded-full flex items-center justify-center', tierRingClasses]">
          <div :class="['size-72 rounded-full flex items-center justify-center', tierBackgroundClasses]">
            <lfx-icon
              :name="badge.config.icon"
              :size="128"
              :class="tierIconClasses"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, type ComponentPublicInstance } from 'vue';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import type { ProjectBadge } from '../config/badge.types';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const props = defineProps<{
  badge: ProjectBadge;
  previewRef: ComponentPublicInstance | null;
}>();

const { project } = storeToRefs(useProjectStore());
const { showToast } = useToastService();

const badgeRenderRef = ref<HTMLElement | null>(null);

const tierRingClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'border-4 border-dashed border-warning-400',
    silver: 'border-4 border-dashed border-neutral-400',
    gold: 'border-4 border-dashed border-warning-500',
    black: 'border-4 border-dashed border-neutral-600',
  };
  return classes[props.badge.tier] || '';
});

const tierBackgroundClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'bg-gradient-to-b from-warning-200 to-warning-100',
    silver: 'bg-gradient-to-b from-neutral-200 to-neutral-100',
    gold: 'bg-gradient-to-b from-warning-300 to-warning-200',
    black: 'bg-gradient-to-b from-neutral-700 to-neutral-600',
  };
  return classes[props.badge.tier] || '';
});

const tierIconClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'text-warning-700',
    silver: 'text-neutral-500',
    gold: 'text-warning-600',
    black: 'text-neutral-300',
  };
  return classes[props.badge.tier] || '';
});

const downloadImage = async (element: HTMLElement | null, filename: string) => {
  if (!element) return;

  try {
    await document?.fonts.ready;
    await nextTick();

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      imageTimeout: 5000,
      backgroundColor: 'white',
      scale: 2,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    showToast('Failed to download image', ToastTypesEnum.negative);
  }
};

const downloadCard = () => {
  const element = props.previewRef?.$el as HTMLElement | null;
  const filename = `LFX Insights - ${project.value?.name || 'Project'} - ${props.badge.config.title} Achievement Card`;
  downloadImage(element, filename);
};

const downloadBadge = () => {
  const filename = `LFX Insights - ${project.value?.name || 'Project'} - ${props.badge.config.title} Badge`;
  downloadImage(badgeRenderRef.value, filename);
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesShareDownload',
};
</script>
