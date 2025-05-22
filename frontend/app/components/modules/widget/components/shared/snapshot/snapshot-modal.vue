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
            {{ widgetConfig.name }}
          </p>
          <h3 class="text-heading-3 font-secondary font-bold">
            Snapshot
          </h3>
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
        <p class="text-neutral-500 text-xs font-semibold leading-5 text-center mb-px">
          Preview
        </p>
        <div class="-m-px bg-white border border-neutral-200 rounded-lg">
          <div
            ref="snapshot"
            class="snapshot"
          >
            <lfx-snapshot-preview
              :widget-name="props.widgetName"
              :data="props.data"
            />
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {computed, nextTick} from "vue";
import html2canvas from "html2canvas";
import LfxModal from "~/components/uikit/modal/modal.vue";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxSnapshotPreview from "~/components/modules/widget/components/shared/snapshot/snapshot-preview.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";

const props = defineProps<{
  modelValue: boolean;
  widgetName: Widget,
  data: object
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void;
}>();

const snapshot = ref(null);

const isModalOpen = computed<boolean>({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});
const {project, repository} = storeToRefs(useProjectStore())
const repoName = computed(() => (repository?.value?.name || '').split('/').at(-1));

const widgetConfig = computed(() => lfxWidgets[props.widgetName]);

const download = async () => {
  if (!snapshot.value) return
  try{
    await document?.fonts.ready;
    await nextTick();
    const canvas = await html2canvas(snapshot.value, {
      useCORS: true,
      allowTaint: false,
      imageTimeout: 5000,
      backgroundColor: 'white',
    })
    const dataUrl = canvas.toDataURL('image/png')
    const link = document?.createElement('a')
    const fileName = `LFX Insights - ${project.value?.name || ''}${
        repoName.value ? ` / ${repoName.value}` : ''
    } - ${widgetConfig.value.name}`
    link.download = `${fileName}.png`
    link.href = dataUrl
    document.body.appendChild(link);
    link.click()
    document.body.removeChild(link);
  } catch (e) {
    console.error('Error while downloading snapshot', e)
  }
  isModalOpen.value = false;
}
</script>

<script lang="ts">
export default {
  name: 'LfxSnapshotModal'
}
</script>
