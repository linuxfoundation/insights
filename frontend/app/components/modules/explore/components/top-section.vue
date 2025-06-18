<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <div class="lg:flex hidden flex-row gap-4 xl:gap-8 items-start">
      <lfx-explore-list-card
        v-for="tab in TOP_SECTION_TABS"
        :key="tab.title"
        :value="tab"
      />
    </div>

    <div class="lg:hidden block -mt-1">
      <div class="-mx-5 overflow-x-auto">
        <div class="flex gap-2 justify-start sm:justify-center w-full py-1 px-5  min-w-max">
          <button
            v-for="(tab, index) in TOP_SECTION_TABS"
            :key="index"
            type="button"
            class="c-menu-button !text-xs"
            :class="{
              'is-active': activeTab === index,
            }"
            @click="activeTab = index"
          >
            <lfx-icon
              :name="tab.icon"
              :size="14"
            />
            {{ tab.title }}
          </button>
        </div>
      </div>
      <div class="mt-7">
        <template
          v-for="(tab, index) in TOP_SECTION_TABS"
          :key="index"
        >
          <lfx-explore-list-card
            v-if="activeTab === index"
            :value="tab"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxExploreListCard from '~/components/modules/explore/components/list-card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { TOP_SECTION_TABS } from '~/components/modules/explore/config/top-section-tabs';

const activeTab = ref(0);

</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopSection'
};
</script>
