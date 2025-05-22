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
      <div class="flex justify-between mb-8">
        <div>
          <p class="text-body-2 text-neutral-500">
            {{ widgetConfig.name }}
          </p>
          <h3 class="text-heading-3 font-secondary font-bold">
            Snapshot
          </h3>
        </div>
      </div>
      <div class="bg-brand-50 border border-brand-100 rounded-lg">
        <p class="text-brand-600 text-xs font-semibold leading-5 text-center mb-px">
          Preview
        </p>
        <div class="-m-px bg-white border border-neutral-200 rounded-lg">
          <div
            id="snapshot"
            ref="snapshot"
          >
            <lfx-snapshot-preview
              :widget-name="props.widgetName"
              :data="props.data"
            />
          </div>
        </div>
      </div>
      <div class="flex justify-end pt-8 items-center gap-4">
        <lfx-button
          type="tertiary"
          button-style="pill"
          @click="isModalOpen = false"
        >
          Cancel
        </lfx-button>
        <lfx-button
          type="primary"
          button-style="pill"
          @click="download()"
        >
          <lfx-icon name="arrow-down-to-line" />
          Download PNG
        </lfx-button>
      </div>
    </div>
  </lfx-modal>
</template>

<script lang="ts" setup>
import { toPng } from 'html-to-image'
import {storeToRefs} from "pinia";
import {computed} from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxSnapshotPreview from "~/components/modules/widget/components/shared/snapshot/snapshot-preview.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

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
    const dataUrl = await toPng(snapshot.value, {
      pixelRatio: 2,
      backgroundColor: 'white',
    })
    const link = document?.createElement('a')
    const fileName = `LFX Insights - ${project.value?.name || ''}${
        repoName.value ? ` / ${repoName.value}` : ''
    } - ${widgetConfig.value.name}`
    link.download = `${fileName}.png`
    link.href = dataUrl
    link.click()
    link.remove()
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
