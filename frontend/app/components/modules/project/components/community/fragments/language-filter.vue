<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2">
    <label class="text-xs font-semibold text-neutral-900"> Language </label>
    <lfx-dropdown
      v-model:visibility="dropdownOpen"
      class="!w-full"
      match-width
    >
      <template #trigger>
        <lfx-dropdown-selector
          type="filled"
          class="w-full flex justify-between !rounded-full"
        >
          <div
            v-if="selectedLanguages.length === 0"
            class="text-neutral-900"
          >
            All languages
          </div>
          <lfx-community-selected-chips
            v-else
            :items="selectedChipItems"
            :max-displayed="maxDisplayedChips"
          />
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
          label="All languages"
          :selected="selectedLanguages.length === 0"
          @toggle="toggleAll"
        />

        <hr class="border-slate-50" />

        <!-- Language Options -->
        <lfx-community-filter-option
          v-for="language in availableLanguages"
          :key="language.value"
          :option="language"
          :selected="selectedLanguages.includes(language.value)"
          @toggle="toggleLanguage(language.value)"
        />
      </div>
    </lfx-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LfxCommunitySelectedChips from './selected-chips.vue';
import LfxCommunityFilterOption from './filter-option.vue';
import LfxCommunityFilterSelectAll from './filter-select-all.vue';
import type { SelectedChipItem } from './selected-chips.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';

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

const availableLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
];

const selectedLanguages = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value),
});

const selectedChipItems = computed<SelectedChipItem[]>(() =>
  selectedLanguages.value.map((language) => ({
    value: language,
    label: availableLanguages.find((l) => l.value === language)?.label || language,
  })),
);

const toggleLanguage = (language: string) => {
  const current = [...selectedLanguages.value];
  const index = current.indexOf(language);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(language);
  }
  selectedLanguages.value = current;
};

const toggleAll = () => {
  selectedLanguages.value = [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityLanguageFilter',
};
</script>
