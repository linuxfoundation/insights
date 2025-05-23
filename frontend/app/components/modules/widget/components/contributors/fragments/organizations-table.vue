<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="lfx-table"
    :class="props.showFullList ? 'h-full pb-4 sm:pb-6' : ''"
  >
    <div
      class="lfx-table-header"
      :class="props.showFullList ? 'px-4 sm:px-6' : ''"
    >
      <div class="flex flex-row gap-3 items-center">
        <div
          v-if="props.showFullList"
          class="mr-1"
        >
          #
        </div>
        Organization
      </div>
      <div>Total contributions</div>
    </div>

    <lfx-scrollable-shadow  :class="props.showFullList ? 'px-4 sm:px-6 overflow-y-auto' : ''">
      <div
        v-for="(organization, index) in props.organizations"
        :key="index"
        class="lfx-table-row"
      >
        <div class="flex flex-row gap-3 items-center">
          <div
            v-if="props.showFullList"
            class="mr-1 text-neutral-400"
          >
            {{ index + 1 }}
          </div>
          <lfx-avatar
            :src="organization.logo"
            type="organization"
          />
          <div>{{ organization.name }}</div>
        </div>
        <div>
          {{ formatNumber(organization.contributions) }}
          <span v-if="props.showPercentage"> - {{ organization.percentage }}% </span>
        </div>
      </div>
      <div
        v-if="showLoadMore"
        class="lfx-table-row"
      >
        <div
          ref="loadMore"
          class="flex flex-row gap-2 items-center justify-center w-full"
        >
          <span>
            <lfx-spinner
              :size="16"
              class="text-brand-300"
              :type="'light'"
            />
          </span>
          <span class="text-sm text-brand-300 font-semibold">
            Loading organizations
          </span>
        </div>
      </div>

    </lfx-scrollable-shadow>
  </div>
</template>

<script setup lang="ts">
import {
 ref, onMounted, computed, watch
} from 'vue';
import type { Organization } from '~~/types/contributors/responses.types';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxScrollableShadow from '~/components/uikit/scrollable-shadow/scrollable-shadow.vue';
import LfxSpinner from "~/components/uikit/spinner/spinner.vue";
import { isElementVisible } from '~/components/shared/utils/helper';

const emit = defineEmits<{(e: 'loadMore'): void
}>();
const loadMore = ref(null);

const props = withDefaults(
  defineProps<{
    metric: string;
    organizations: Organization[];
    showPercentage?: boolean;
    showFullList?: boolean;
    total?: number;
    isFetchingNextPage?: boolean;
  }>(),
  {
    showPercentage: false,
    showFullList: false,
    total: 0,
    isFetchingNextPage: false
  }
);

const showLoadMore = computed(() => props.total && props.total > props.organizations.length && props.showFullList);

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0
};

const handleIntersectCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      emit('loadMore');
    }
  });
}

const isLoadMoreVisible = () => {
  if (!loadMore.value) {
    return false;
  }

  return isElementVisible(loadMore.value as HTMLElement);
};

onMounted(() => {
  if (loadMore.value) {
    const observer = new IntersectionObserver(handleIntersectCallback, options);
    observer.observe(loadMore.value);
  }
});

watch(() => props.isFetchingNextPage, (newVal: boolean) => {
  if (!newVal) {
    // check if the load more is visible
    if (isLoadMoreVisible()) {
      emit('loadMore');
    }
  }
});
</script>
<script lang="ts">
export default {
  name: 'LfxOrganizationsTable'
};
</script>
