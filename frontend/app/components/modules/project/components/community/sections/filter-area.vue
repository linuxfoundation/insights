<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-5">
    <!-- Platform Filter -->
    <lfx-community-platform-filter
      v-model="selectedPlatforms"
      :max-displayed-chips="maxDisplayedChips"
    />

    <!-- Keywords Filter -->
    <lfx-community-keyword-filter
      v-model="selectedKeywords"
      :keywords="availableKeywords"
      :max-displayed-chips="maxDisplayedChips"
    />

    <!-- Sentiment Filter -->
    <lfx-community-sentiment-filter
      v-model="selectedSentiments"
      :max-displayed-chips="maxDisplayedChips"
    />

    <!-- Language Filter -->
    <lfx-community-language-filter
      v-model="selectedLanguages"
      :max-displayed-chips="maxDisplayedChips"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import LfxCommunityPlatformFilter from '../fragments/platform-filter.vue';
import LfxCommunityKeywordFilter from '../fragments/keyword-filter.vue';
import LfxCommunitySentimentFilter from '../fragments/sentiment-filter.vue';
import LfxCommunityLanguageFilter from '../fragments/language-filter.vue';

// Selected values
const selectedPlatforms = ref<string[]>([]);
const selectedKeywords = ref<string[]>([]);
const selectedSentiments = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);

// Max chips to display before showing +X
const maxDisplayedChips = 2;

// Available keywords (this should come from API/props in real implementation)
const availableKeywords = ref<string[]>(['kubernetes', 'docker', 'containers', 'cloud native', 'microservices']);

// Emit filter changes (for parent component to use)
const emit = defineEmits<{
  (e: 'update:platforms', value: string[]): void;
  (e: 'update:keywords', value: string[]): void;
  (e: 'update:sentiments', value: string[]): void;
  (e: 'update:languages', value: string[]): void;
}>();

// Watch for changes and emit
watch(selectedPlatforms, (value: string[]) => {
  emit('update:platforms', value);
});

watch(selectedKeywords, (value: string[]) => {
  emit('update:keywords', value);
});

watch(selectedSentiments, (value: string[]) => {
  emit('update:sentiments', value);
});

watch(selectedLanguages, (value: string[]) => {
  emit('update:languages', value);
});
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterArea',
};
</script>
