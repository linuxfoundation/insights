<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <div class="lg:grid hidden grid-cols-3 gap-8">
      <lfx-explore-list-card
        v-for="tab in tabs"
        :key="tab.title"
        :component="tab.component"
        :title="tab.title"
        :description="tab.description"
      />
    </div>

    <div class="lg:hidden block">
      <div class="flex gap-2 justify-start sm:justify-center w-full scroll-x-auto overflow-x-auto">
        <button
          v-for="(tab, index) in tabs"
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
      <div class="mt-8">
        <template
          v-for="(tab, index) in tabs"
          :key="index"
        >
          <lfx-explore-list-card
            v-if="activeTab === index"
            :component="tab.component"
            :title="tab.title"
            :description="tab.description"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxExploreListCard from '~/components/modules/explore/components/list-card.vue';
import LfxExploreTopProjects from '~/components/modules/explore/components/top-projects.vue';
import LfxExploreTopContributors from '~/components/modules/explore/components/top-contributors.vue';
import LfxExploreTopOrganizations from '~/components/modules/explore/components/top-organizations.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const activeTab = ref(0);
const tabs = [
  {
    title: 'Top projects',
    description: `Projects ranked by Criticality Score — a metric that reflects their 
    importance, usage, and potential impact across the ecosystem.`,
    component: LfxExploreTopProjects,
    icon: 'laptop-code'
  },
  {
    title: 'Top active contributors',
    description: `Developers ranked by volume of contributions over the last 10 years, 
    highlighting the most active and influential individuals in the open source ecosystem.`,
    component: LfxExploreTopContributors,
    icon: 'people-group'
  },
  {
    title: 'Top active organizations',
    description: `Most influential organizations based on the total number of contributions 
    made across the most relevant open source projects over the last 10 years.`,
    component: LfxExploreTopOrganizations,
    icon: 'buildings'
  }
];
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopSection'
};
</script>
