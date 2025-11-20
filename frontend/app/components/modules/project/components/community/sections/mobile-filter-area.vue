<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-5">
    <!-- Platform Filter -->
    <lfx-community-platform-filter />

    <!-- Keywords Filter -->
    <lfx-community-keyword-filter />

    <!-- Sentiment Filter -->
    <lfx-community-sentiment-filter />

    <!-- Language Filter -->
    <!-- Hiding for now until we have the API support -->
    <!-- <lfx-community-language-filter /> -->

    <lfx-button
      type="transparent"
      class="w-full justify-center"
      button-style="pill"
      @click="resetFilters"
    >
      <lfx-icon
        name="arrow-rotate-left"
        :size="16"
      />
      Reset filters
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import LfxCommunityPlatformFilter from '../fragments/platform-filter.vue';
import LfxCommunityKeywordFilter from '../fragments/keyword-filter.vue';
import LfxCommunitySentimentFilter from '../fragments/sentiment-filter.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
// import LfxCommunityLanguageFilter from '../fragments/language-filter.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { selectedPlatforms, selectedKeywords, selectedSentiments, selectedLanguages } = storeToRefs(useProjectStore());

const resetFilters = () => {
  selectedPlatforms.value = [];
  selectedKeywords.value = [];
  selectedSentiments.value = [];
  selectedLanguages.value = [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterArea',
};
</script>
