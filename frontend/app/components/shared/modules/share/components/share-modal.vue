<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="30rem"
  >
    <section class="p-6">
      <div class="flex justify-between">
        <div>
          <p
            v-if="defaults?.area"
            class="text-body-2 text-neutral-500 pb-1"
          >
            {{ defaults.area }}
          </p>
          <h3 class="text-heading-3 font-bold">
            Share
          </h3>
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="isModalOpen = false"
        />
      </div>
      <lfx-tabs
        v-if="defaults.showGithubBadge"
        class="mt-4"
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      >
        <template #slotItem="{ option }">
          <div class="flex items-center gap-2">
            <lfx-icon
              :name="option.icon"
              :size="14"
            />
            {{ option.label }}
          </div>
        </template>
      </lfx-tabs>

      <lfx-share-actions
        v-if="activeTab === 'link'"
        :defaults="defaults"
        @copied="isModalOpen = false"
      />
      <lfx-share-badge
        v-if="activeTab === 'github-badge'"
        @copied="isModalOpen = false"
      />
    </section>

    <component :is="defaults.additionalShare" />
  </lfx-modal>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import type {ShareData} from "~/components/shared/modules/share/types/share.types";
import LfxShareActions from "~/components/shared/modules/share/components/share-actions.vue";
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxShareBadge from "~/components/shared/modules/share/components/share-badge.vue";

const props = defineProps<{
  modelValue: boolean;
  defaults: ShareData
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void;
}>();

const activeTab = ref('link');

const tabs = [
  {
    label: 'Link',
    value: 'link',
    icon: 'link'
  },
  {
    label: 'GitHub Badge',
    value: 'github-badge',
    icon: 'award'
  }
]
const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
  },
})

watch(() => props.modelValue, (value) => {
  if (value) {
    activeTab.value = props.defaults.activeTab || 'link';
  }
}, { immediate: true })
</script>

<script lang="ts">
export default {
  name: 'LfxShareModal',
};
</script>
