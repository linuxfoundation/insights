<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2">
    <label class="text-xs font-semibold text-neutral-900"> Platform </label>
    <lfx-dropdown
      v-model:visibility="dropdownOpen"
      match-width
      class="!w-full"
    >
      <template #trigger>
        <lfx-dropdown-selector
          type="filled"
          class="w-full flex justify-between !rounded-full"
        >
          <div
            v-if="selectedPlatforms.length === 0"
            class="text-neutral-900"
          >
            All platforms
          </div>
          <lfx-community-selected-chips
            v-else
            :items="selectedChipItems"
            :max-displayed="maxDisplayedChips"
          >
            <template #chip="{ item }">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.label"
                class="w-[15px] h-[15px] object-contain"
              />
              <span class="text-xs leading-4 text-neutral-900">
                {{ item.label }}
              </span>
            </template>
          </lfx-community-selected-chips>
          <template #append>
            <lfx-icon
              :name="dropdownOpen ? 'angle-up' : 'angle-down'"
              :size="12"
              class="text-neutral-900 shrink-0"
            />
          </template>
        </lfx-dropdown-selector>
      </template>

      <div class="flex flex-col gap-1">
        <!-- Select All Option -->
        <lfx-community-filter-select-all
          label="All platforms"
          :selected="selectedPlatforms.length === 0"
          @toggle="toggleAll"
        />

        <hr class="border-slate-50" />

        <!-- Platform Options -->
        <lfx-community-filter-option
          v-for="platform in availablePlatforms"
          :key="platform.key"
          :option="platform"
          :selected="selectedPlatforms.includes(platform.key)"
          @toggle="togglePlatform(platform.key)"
        >
          <template #default="{ option }">
            <div class="flex items-center gap-2">
              <img
                :src="option.image"
                :alt="option.label"
                class="w-4 h-4 object-contain"
              />
              <span class="text-neutral-900">{{ option.label }}</span>
            </div>
          </template>
        </lfx-community-filter-option>
      </div>
    </lfx-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { communityConfigs } from '../config';
import LfxCommunitySelectedChips from './selected-chips.vue';
import LfxCommunityFilterOption from './filter-option.vue';
import LfxCommunityFilterSelectAll from './filter-select-all.vue';
import type { SelectedChipItem } from './selected-chips.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    maxDisplayedChips?: number;
  }>(),
  {
    modelValue: () => [],
    maxDisplayedChips: 2,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const dropdownOpen = ref(false);

const platformConfigs = communityConfigs;

const availablePlatforms = computed(() =>
  Object.entries(communityConfigs).map(([key, config]) => ({
    key,
    label: config.label,
    image: config.image,
  })),
);

const selectedPlatforms = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value),
});

const selectedChipItems = computed<SelectedChipItem[]>(() =>
  selectedPlatforms.value.map((platform) => ({
    value: platform,
    label: platformConfigs[platform]?.label || platform,
    image: platformConfigs[platform]?.image,
  })),
);

const togglePlatform = (platform: string) => {
  const current = [...selectedPlatforms.value];
  const index = current.indexOf(platform);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(platform);
  }
  selectedPlatforms.value = current;
};

const toggleAll = () => {
  selectedPlatforms.value = [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityPlatformFilter',
};
</script>
