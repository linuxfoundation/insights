<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="41.5rem"
  >
    <div class="p-6">
      <div class="flex justify-between">
        <div>
          <p class="text-body-2 text-neutral-500">
            {{ widgetConfig?.name }}
          </p>
          <h3 class="text-heading-3 font-secondary font-bold">Snapshot</h3>
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="isModalOpen = false"
        />
      </div>
      <div class="py-8">
        <lfx-button
          type="primary"
          button-style="pill"
          class="w-full justify-center"
          @click="download()"
        >
          <lfx-icon name="arrow-down-to-line" />
          Download PNG
        </lfx-button>
      </div>
      <div class="bg-neutral-100 border border-neutral-200 rounded-lg">
        <p class="text-neutral-500 text-xs font-semibold leading-5 text-center mb-px">Preview</p>
        <div class="-m-px bg-white border border-neutral-200 rounded-lg overflow-auto">
          <div
            ref="snapshot"
            class="snapshot min-w-150"
          >
            <lfx-snapshot-preview
              :widget-name="props.widgetName"
              :data="props.data"
              :use-slot="props.useSlot"
            >
              <slot />
            </lfx-snapshot-preview>
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, nextTick } from 'vue';
import html2canvas from 'html2canvas';
import LfxModal from '~/components/uikit/modal/modal.vue';
import type { Widget } from '~/components/modules/widget/types/widget';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSnapshotPreview from '~/components/modules/widget/components/shared/snapshot/snapshot-preview.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const props = defineProps<{
  modelValue: boolean;
  widgetName: Widget;
  data: object;
  useSlot?: boolean;
  snapshotName?: string;
}>();

const { showToast } = useToastService();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const snapshot = ref(null);

const isModalOpen = computed<boolean>({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
const { project, selectedRepositories } = storeToRefs(useProjectStore());
const repoName = computed(
  () => selectedRepositories?.value?.map((repo) => repo.name.split('/').at(-1)).join(', ') || '',
);

const widgetConfig = computed(() => lfxWidgets[props.widgetName]);

const shouldProxy = (src: string): boolean => {
  if (!src) return false;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  try {
    const parsed = new URL(src, window.location.href);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const rewriteImagesThroughProxy = async (root: HTMLElement): Promise<() => void> => {
  const imgs = Array.from(root.querySelectorAll('img')).filter((img) => shouldProxy(img.src));
  const originals = imgs.map((img) => img.src);
  imgs.forEach((img) => {
    img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}`;
  });
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
          };
          img.addEventListener('load', done);
          img.addEventListener('error', done);
        }),
    ),
  );
  return () => {
    imgs.forEach((img, i) => {
      img.src = originals[i]!;
    });
  };
};

const download = async () => {
  if (!snapshot.value) return;
  let restoreImages: (() => void) | undefined;
  try {
    await document?.fonts.ready;
    await nextTick();
    restoreImages = await rewriteImagesThroughProxy(snapshot.value);
    const canvas = await html2canvas(snapshot.value, {
      useCORS: true,
      allowTaint: false,
      imageTimeout: 5000,
      backgroundColor: 'white',
    });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document?.createElement('a');
    const fileName = `LFX Insights - ${project.value?.name || ''}${
      repoName.value ? ` / ${repoName.value}` : ''
    } - ${props.snapshotName || widgetConfig.value?.name}`;
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    showToast('Failed to download snapshot', ToastTypesEnum.negative);
  } finally {
    restoreImages?.();
  }
  isModalOpen.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxSnapshotModal',
};
</script>
