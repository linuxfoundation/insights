<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2">
    <label class="text-xs font-semibold text-neutral-900"> Keywords </label>
    <lfx-dropdown
      v-model:visibility="dropdownOpen"
      class="!w-full"
      match-width
      :popover-class="!isInsideModal ? 'dropdown-popover' : ''"
    >
      <template #trigger>
        <lfx-dropdown-selector
          type="filled"
          class="w-full flex justify-between !rounded-full"
        >
          <div
            v-if="selectedKeywords.length === 0"
            class="text-neutral-900 flex-1 min-w-0"
          >
            All keywords
          </div>
          <lfx-community-selected-chips
            v-else
            class="flex-1 min-w-0"
            :items="selectedChipItems"
            :max-displayed="maxDisplayedChips"
          />
          <template #append>
            <lfx-icon
              :name="dropdownOpen ? 'angle-up' : 'angle-down'"
              :size="12"
              class="text-neutral-900 shrink-0 ml-2"
            />
          </template>
        </lfx-dropdown-selector>
      </template>

      <div class="flex flex-col gap-1">
        <!-- Select All Option -->
        <lfx-community-filter-select-all
          label="All keywords"
          :selected="selectedKeywords.length === 0"
          @toggle="toggleAll"
        />

        <hr class="border-slate-50" />

        <!-- Keyword Options -->
        <lfx-community-filter-option
          v-for="keyword in keywords"
          :key="keyword"
          :option="{ label: keyword }"
          :selected="selectedKeywords.includes(keyword)"
          @toggle="toggleKeyword(keyword)"
        />
      </div>
    </lfx-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxCommunitySelectedChips from './selected-chips.vue';
import LfxCommunityFilterOption from './filter-option.vue';
import LfxCommunityFilterSelectAll from './filter-select-all.vue';
import type { SelectedChipItem } from './selected-chips.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const props = defineProps<{
  modelValue: string[];
  isInsideModal?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>();

const selectedKeywords = computed({
  get: () => props.modelValue,
  set: (value: string[]) => {
    emit('update:modelValue', value);
  },
});

const maxDisplayedChips = 2;
const { project } = storeToRefs(useProjectStore());
const dropdownOpen = ref(false);

const selectedChipItems = computed<SelectedChipItem[]>(() =>
  selectedKeywords.value.map((keyword) => ({
    value: keyword,
    label: keyword,
  })),
);

const keywords = computed(() => project.value?.communityKeywords || []);

const toggleKeyword = (keyword: string) => {
  const current = [...selectedKeywords.value];
  const index = current.indexOf(keyword);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(keyword);
  }
  selectedKeywords.value = current;
};

const toggleAll = () => {
  selectedKeywords.value = [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityKeywordFilter',
};
</script>
