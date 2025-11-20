<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isCommunityFilterOpen"
    class="p-6"
  >
    <section class="flex flex-col h-[calc(100vh-160px)]">
      <div class="flex justify-end">
        <lfx-icon-button
          icon="close"
          size="small"
          @click="closeModal"
        />
      </div>
      <div class="flex flex-col justify-between h-full">
        <div class="flex flex-col gap-5">
          <!-- Platform Filter -->
          <lfx-community-platform-filter
            v-model="platformFilterCache"
            is-inside-modal
          />

          <!-- Keywords Filter -->
          <lfx-community-keyword-filter
            v-model="keywordFilterCache"
            is-inside-modal
          />

          <!-- Sentiment Filter -->
          <lfx-community-sentiment-filter
            v-model="sentimentFilterCache"
            is-inside-modal
          />

          <!-- Language Filter -->
          <!-- Hiding for now until we have the API support -->
          <!-- <lfx-community-language-filter v-model="languageFilterCache" /> -->
        </div>
        <div class="flex flex-col gap-4">
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
          <lfx-button
            type="primary"
            class="w-full justify-center"
            button-style="pill"
            @click="applyFilters"
          >
            Apply filters
          </lfx-button>
        </div>
      </div>
    </section>
  </lfx-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import LfxCommunityPlatformFilter from '../fragments/platform-filter.vue';
import LfxCommunityKeywordFilter from '../fragments/keyword-filter.vue';
import LfxCommunitySentimentFilter from '../fragments/sentiment-filter.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
// import LfxCommunityLanguageFilter from '../fragments/language-filter.vue';
import { useCommunityStore } from '~~/app/components/modules/project/components/community/store/community.store';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';

const { selectedPlatforms, selectedKeywords, selectedSentiments, selectedLanguages, isCommunityFilterOpen } =
  storeToRefs(useCommunityStore());

const platformFilterCache = ref<string[]>(selectedPlatforms.value);
const keywordFilterCache = ref<string[]>(selectedKeywords.value);
const sentimentFilterCache = ref<string[]>(selectedSentiments.value);
// const languageFilterCache = ref<string[]>(selectedLanguages.value);

const resetFilters = () => {
  selectedPlatforms.value = [];
  selectedKeywords.value = [];
  selectedSentiments.value = [];
  selectedLanguages.value = [];

  platformFilterCache.value = [];
  keywordFilterCache.value = [];
  sentimentFilterCache.value = [];
  // languageFilterCache.value = [];

  isCommunityFilterOpen.value = false;
};

const applyFilters = () => {
  selectedPlatforms.value = platformFilterCache.value;
  selectedKeywords.value = keywordFilterCache.value;
  selectedSentiments.value = sentimentFilterCache.value;
  // selectedLanguages.value = languageFilterCache.value;

  isCommunityFilterOpen.value = false;
};

const closeModal = () => {
  isCommunityFilterOpen.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterModal',
};
</script>
