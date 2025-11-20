<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-5">
    <!-- Platform Filter -->
    <lfx-community-platform-filter v-model="selectedPlatforms" />

    <!-- Keywords Filter -->
    <lfx-community-keyword-filter v-model="selectedKeywords" />

    <!-- Sentiment Filter -->
    <lfx-community-sentiment-filter v-model="selectedSentiments" />

    <!-- Language Filter -->
    <!-- Hiding for now until we have the API support -->
    <!-- <lfx-community-language-filter v-model="selectedLanguages" /> -->

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
import { useCommunityStore } from '~~/app/components/modules/project/components/community/store/community.store';

const { selectedPlatforms, selectedKeywords, selectedSentiments, selectedLanguages } = storeToRefs(useCommunityStore());

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
