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
      <lfx-button
        type="tertiary"
        button-style="pill"
      >
        <lfx-icon
          name="arrow-down-to-line"
          :size="12"
        />
        Download (PNG)
      </lfx-button>
    </template>

    <!-- Achievement Card Option -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors"
      @click="downloadCard"
    >
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-neutral-900">Achievement card</span>
        <span class="text-xs text-neutral-500">720x540px · PNG</span>
      </div>
      <img
        src="/images/badges/shared/card-preview.svg"
        alt="Card preview"
      />
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
      <img
        src="/images/badges/shared/badge-preview.svg"
        alt="Badge preview"
      />
    </div>
  </lfx-dropdown>

  <!-- Hidden render targets for downloads -->
  <div class="fixed -left-[9999px] -top-[9999px] pointer-events-none">
    <lfx-card-download-preview
      ref="cardRenderRef"
      :badge="badge"
    />
    <lfx-badge-download-preview
      ref="badgeRenderRef"
      :badge="badge"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import type { ProjectBadge } from '../../types/badge.types';
import LfxCardDownloadPreview from '../download/card-download-preview.vue';
import LfxBadgeDownloadPreview from '../download/badge-download-preview.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const { project } = storeToRefs(useProjectStore());
const { showToast } = useToastService();

const cardRenderRef = ref<InstanceType<typeof LfxCardDownloadPreview> | null>(null);
const badgeRenderRef = ref<InstanceType<typeof LfxBadgeDownloadPreview> | null>(null);

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
  const element = cardRenderRef.value?.$el as HTMLElement | null;
  const filename = `LFX Insights - ${project.value?.name || 'Project'} - ${props.badge.config.title} Achievement Card`;
  downloadImage(element, filename);
};

const downloadBadge = () => {
  const element = badgeRenderRef.value?.$el as HTMLElement | null;
  const filename = `LFX Insights - ${project.value?.name || 'Project'} - ${props.badge.config.title} Badge`;
  downloadImage(element, filename);
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesShareDownload',
};
</script>
