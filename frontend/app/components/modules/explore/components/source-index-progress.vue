<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-5">
    <div
      v-for="item in data"
      :key="item.name"
      class="flex flex-col gap-2 items-start w-full"
    >
      <div class="text-sm text-neutral-900 font-semibold">
        {{ item.name }}
      </div>
      <div class="flex w-full items-center">
        <div
          class="h-2 bg-brand-700 rounded-xs"
          :style="{ width: `${calculatePercentage(item)}%` }"
        />
        <div
          v-if="sort === 'totalContributors'"
          class="text-xs text-neutral-600 ml-2 whitespace-nowrap"
        >
          {{ formatNumber(item.totalContributors) }} contributors
        </div>
        <div
          v-else
          class="text-xs text-neutral-600 ml-2 whitespace-nowrap"
        >
          {{ formatNumberCurrency(item.softwareValue, 'USD') }}
        </div>
      </div>
    </div>
    <div class="flex justify-center sm:justify-start py-2">
      <nuxt-link
        :to="exploreLink"
        class="text-sm text-brand-500 font-semibold hover:underline"
      >
        {{ exploreLinkText }}
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OSSIndexCategoryGroup } from '~~/types/ossindex/category-group';
import type {
  SortType,
  OSIType,
} from '~/components/modules/open-source-index/services/osi.api.service';
import { formatNumber, formatNumberCurrency } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  data: OSSIndexCategoryGroup[] | undefined;
  sort: SortType;
  type: OSIType;
}>();

const maxValue = computed(() =>
  props.data?.reduce(
    (acc, curr) =>
      Math.max(
        acc,
        props.sort === 'totalContributors' ? curr.totalContributors : curr.softwareValue,
      ),
    0,
  ),
);

const calculatePercentage = (item: OSSIndexCategoryGroup) => {
  const value = props.sort === 'totalContributors' ? item.totalContributors : item.softwareValue;
  return maxValue.value ? (value / maxValue.value) * 100 : 0;
};

const exploreLinkText = computed(() =>
  props.type === 'horizontal' ? 'Explore all stacks' : 'Explore all industries',
);
const exploreLink = computed(
  () =>
    `${LfxRoutes.OPENSOURCEINDEX}${props.type === 'horizontal' ? '?type=horizontal' : '?type=vertical'}`,
);
</script>

<script lang="ts">
export default {
  name: 'LfxExploreSourceIndexProgress',
};
</script>
