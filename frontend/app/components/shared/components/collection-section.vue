<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <lfx-project-load-state
      :status="status"
      :error="error"
      :error-message="errorMessage"
      :is-empty="isEmpty"
    >
      <div class="flex items-center justify-between w-full gap-4">
        <div class="flex items-center gap-4">
          <span
            class="text-white block rounded-full p-2"
            :class="iconBackground"
          >
            <lfx-icon
              :name="icon"
              :size="24"
            />
          </span>
          <div class="text-neutral-900">
            <h2 class="text-xl font-bold font-secondary leading-8">{{ title }}</h2>
            <p class="text-sm leading-4 text-neutral-600">{{ subtitle }}</p>
          </div>
        </div>

        <div v-if="viewAllRoute">
          <nuxt-link :to="{ name: viewAllRoute }">
            <lfx-button
              type="transparent"
              button-style="pill"
            >
              <lfx-icon
                name="rectangle-history"
                :size="16"
              />
              <span class="text-sm text-nowrap">View all</span>
            </lfx-button>
          </nuxt-link>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <slot />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { discoveryCollectionTabs } from '~/components/modules/collection/config/collection-type-config';
import type { CollectionType } from '~~/types/collection';

const props = withDefaults(
  defineProps<{
    type: CollectionType;
    status?: 'pending' | 'success' | 'error' | 'idle';
    error?: Error | null;
    errorMessage?: string;
    isEmpty?: boolean;
  }>(),
  {
    status: 'success',
    error: null,
    errorMessage: 'Error fetching collections',
    isEmpty: false,
  },
);

const title = computed(() => discoveryCollectionTabs.find((tab) => tab.type === props.type)?.detailsLabel || '');
const subtitle = computed(() => discoveryCollectionTabs.find((tab) => tab.type === props.type)?.description || '');
const icon = computed(() => discoveryCollectionTabs.find((tab) => tab.type === props.type)?.icon || '');
const iconBackground = computed(
  () => discoveryCollectionTabs.find((tab) => tab.type === props.type)?.iconHighlightClass || '',
);
const viewAllRoute = computed(() => discoveryCollectionTabs.find((tab) => tab.type === props.type)?.route || '');
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionSection',
};
</script>
