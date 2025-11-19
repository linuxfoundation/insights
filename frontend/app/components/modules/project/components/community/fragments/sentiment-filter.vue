<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2">
    <label class="text-xs font-semibold text-neutral-900"> Sentiment </label>
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
            v-if="selectedSentiments.length === 0"
            class="text-neutral-900 flex-1 min-w-0"
          >
            All sentiments
          </div>
          <lfx-community-selected-chips
            v-else
            class="flex-1 min-w-0"
            :items="selectedChipItems"
            :max-displayed="maxDisplayedChips"
          >
            <template #chip="{ item }">
              <lfx-icon
                v-if="item.icon"
                :name="item.icon"
                :size="15"
                :class="item.iconClass"
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
              class="text-neutral-900 shrink-0 ml-2"
            />
          </template>
        </lfx-dropdown-selector>
      </template>

      <div class="flex flex-col gap-1">
        <!-- Select All Option -->
        <lfx-community-filter-select-all
          label="All sentiments"
          :selected="selectedSentiments.length === 0"
          @toggle="toggleAll"
        />

        <hr class="border-slate-50" />

        <!-- Sentiment Options -->
        <lfx-community-filter-option
          v-for="sentiment in availableSentiments"
          :key="sentiment.value"
          :option="sentiment"
          :selected="selectedSentiments.includes(sentiment.value)"
          @toggle="toggleSentiment(sentiment.value)"
        >
          <template #default="{ option }">
            <div class="flex items-center gap-2">
              <lfx-icon
                :name="option.icon"
                :size="16"
                :class="option.color"
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
import { storeToRefs } from 'pinia';
import LfxCommunitySelectedChips from './selected-chips.vue';
import LfxCommunityFilterOption from './filter-option.vue';
import LfxCommunityFilterSelectAll from './filter-select-all.vue';
import type { SelectedChipItem } from './selected-chips.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { availableSentiments } from '~~/app/components/modules/project/config/sentiments';

const { selectedSentiments } = storeToRefs(useProjectStore());

const maxDisplayedChips = 2;
const dropdownOpen = ref(false);

const selectedChipItems = computed<SelectedChipItem[]>(() =>
  selectedSentiments.value.map((sentiment) => {
    const config = availableSentiments.find((s) => s.value === sentiment);
    return {
      value: sentiment,
      label: config?.label || sentiment,
      icon: config?.icon,
      iconClass: config?.color,
    };
  }),
);

const toggleSentiment = (sentiment: string) => {
  const current = [...selectedSentiments.value];
  const index = current.indexOf(sentiment);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(sentiment);
  }
  selectedSentiments.value = current;
};

const toggleAll = () => {
  selectedSentiments.value = [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunitySentimentFilter',
};
</script>
