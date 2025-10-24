<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="40.625rem"
  >
    <div class="p-6">
      <div class="flex justify-between">
        <div>
          <p class="text-body-2 text-neutral-500 mb-1">
            {{ widgetConfig.name }}
          </p>
          <h3 class="text-heading-3 font-secondary font-bold">Embed code</h3>
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="isModalOpen = false"
        />
      </div>
      <div class="py-8">
        <lfx-tabs
          v-model="tab"
          :tabs="tabs"
        />
      </div>
      <div v-if="tab === 'code'">
        <p class="text-body-2 text-neutral-500">
          Copy and paste the following iframe code into your website to provide users with a live
          snapshot of your project's metrics.
        </p>
        <div class="my-8">
          <div
            v-if="height <= 0"
            class="relative"
          >
            <lfx-skeleton class="w-full !h-60 !rounded-lg" />
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <p class="text-body-1 italic text-neutral-500">Loading iFrame code...</p>
            </div>
          </div>
          <pre
            v-else
            class="bg-neutral-50 border border-neutral-200 rounded-md py-2 px-2.5 overflow-auto"
            >{{ iframe }}</pre
          >
        </div>
        <lfx-button
          type="tertiary"
          button-style="pill"
          class="w-full justify-center"
          :disabled="height <= 0"
          @click="copy()"
        >
          <lfx-icon name="clone" />
          Copy code
        </lfx-button>
      </div>
      <div :class="tab === 'preview' ? 'h-auto' : 'h-0 overflow-hidden'">
        <div
          v-if="height <= 0"
          class="relative"
        >
          <lfx-skeleton class="w-full !h-60 !rounded-lg" />
          <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <p class="text-body-1 italic text-neutral-500">Loading preview...</p>
          </div>
        </div>
        <div
          :class="height > 0 ? 'h-auto' : 'h-0 overflow-hidden'"
          class="bg-neutral-100 border border-neutral-200 rounded-lg"
        >
          <p class="text-neutral-500 text-xs font-semibold leading-5 text-center mb-px">Preview</p>
          <div class="-m-px bg-neutral-100 !rounded-lg">
            <div class="overflow-auto">
              <iframe
                ref="preview"
                :src="fullUrl"
                :title="`${widgetConfig.name} Widget Preview`"
                width="600"
                allowfullscreen
                class="rounded-lg border-none"
                @load="adjustIframeHeight"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import type { Widget } from '~/components/modules/widget/types/widget';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import useToastService from '~/components/uikit/toast/toast.service';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

const props = defineProps<{
  modelValue: boolean;
  widgetName: Widget;
  data: object;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const { showToast } = useToastService();

const tab = ref('code');
const preview = ref(null);
const height = ref(0);

const tabs = [
  { label: 'Code', value: 'code' },
  { label: 'Preview', value: 'preview' },
];

const isModalOpen = computed<boolean>({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
const {
  project,
  selectedRepositories,
  selectedRepositoryGroup,
  startDate,
  endDate,
  selectedTimeRangeKey,
} = storeToRefs(useProjectStore());

const widgetConfig = computed(() => lfxWidgets[props.widgetName]);

const domain = computed(() => window?.location.origin);
const baseUrl = computed(() => {
  return `${domain.value}/embed/project/${project.value?.slug}`;
});

const queryParams = computed(() => {
  const params = new URLSearchParams();
  params.set('widget', props.widgetName);
  params.set('startDate', startDate.value || '');
  params.set('endDate', endDate.value || '');
  params.set('timeRangeKey', selectedTimeRangeKey.value || '');
  if (selectedRepositoryGroup.value) {
    params.set('repositoryGroup', selectedRepositoryGroup.value.slug);
  } else if (selectedRepositories.value?.length > 0) {
    params.set('repos', selectedRepositories.value.map((repo) => repo.slug).join('|'));
  }
  Object.entries(props.data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return params.toString();
});

const fullUrl = computed(() => `${baseUrl.value}?${queryParams.value}`);

const iframe = computed(
  () => `<iframe
    src="${fullUrl.value}"
    width="600"
    height="${height.value || 600}"
    allowfullscreen
    loading="lazy"
    style="border: none; border-radius: 8px">
</iframe>
`,
);

const copy = () => {
  if (navigator?.clipboard) {
    navigator?.clipboard.writeText(iframe.value);
    showToast(`Widget embed code copied to clipboard`, ToastTypesEnum.positive);
    isModalOpen.value = false;
  }
};

const adjustIframeHeight = () => {
  if (preview.value?.contentWindow?.document?.body) {
    const { scrollHeight } = preview.value.contentWindow.document.body;
    preview.value.style.height = `${scrollHeight}px`;
    height.value = scrollHeight;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetEmbedModal',
};
</script>
