<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-if="availablePlatforms.length > 0"
    v-model="selectedPlatform"
    placement="bottom-end"
    width="10rem"
    :disabled="availablePlatforms.length <= 1"
  >
    <template #trigger="{ selectedOption }">
      <lfx-button
        type="tertiary"
        size="small"
        button-style="pill"
        class="whitespace-nowrap w-max"
        :class="
          availablePlatforms.length <= 1
            ? 'cursor-default hover:!bg-white !gap-1 active:!outline-1 !outline-neutral-200'
            : ''
        "
      >
        <img
          v-if="selectedOption.image"
          :src="selectedOption.image"
          :alt="selectedOption.label"
          class="w-[15px] h-[15px] object-contain"
        />
        <span class="text-xs font-semibold text-neutral-900">
          {{ selectedOption.label }}
        </span>
        <lfx-icon
          v-if="availablePlatforms.length > 1"
          name="angle-down"
          :size="12"
          class="text-neutral-900"
        />
      </lfx-button>
    </template>

    <lfx-dropdown-item
      v-for="platform in availablePlatforms"
      :key="platform.key"
      :value="platform.key"
      :label="platform.label"
      :image="platform.image"
    >
      <div class="flex items-center gap-2">
        <img
          :src="platform.image"
          :alt="platform.label"
          class="w-4 h-4 object-contain"
        />
        <span class="text-sm text-neutral-900">{{ platform.label }}</span>
      </div>
    </lfx-dropdown-item>
  </lfx-dropdown-select>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { platforms } from '~/config/platforms';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { PlatformConfig } from '~~/types/shared/platforms.types';
import LfxButton from '~/components/uikit/button/button.vue';

const props = defineProps<{
  modelValue: string;
  availablePlatforms?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { project } = storeToRefs(useProjectStore());

const selectedPlatform = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const availablePlatforms = computed<PlatformConfig[]>(() => {
  const connectedPlatformKeys =
    (props.availablePlatforms || Object.keys(platforms)).filter((key) =>
      project.value?.connectedPlatforms.includes(key),
    ) || [];

  return connectedPlatformKeys
    .map((key) => platforms[key])
    .filter((platform): platform is PlatformConfig => !!platform);
});

if (props.modelValue?.length <= 0) {
  emit('update:modelValue', availablePlatforms.value.at(0)?.key || '');
}
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetFilterPlatform',
};
</script>
