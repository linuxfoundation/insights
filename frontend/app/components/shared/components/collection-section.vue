<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
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

      <!-- Desktop: View all in header -->
      <div
        v-if="viewAllRoute && status === 'success' && !props.isEmpty"
        class="hidden md:block"
      >
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
    <div :class="gridClasses">
      <template v-if="status === 'pending'">
        <lfx-collection-card-loading
          v-for="i in 3"
          :key="i"
          :variant="type"
        />
      </template>
      <template v-else-if="status === 'success'">
        <lfx-collections-empty
          v-if="props.isEmpty"
          @created="handleCreated"
        />
        <slot v-else />
      </template>
      <template v-else-if="status === 'error'">
        <lfx-collections-empty @created="handleCreated" />
      </template>
    </div>

    <!-- Mobile: View all at end of list, centered -->
    <div
      v-if="viewAllRoute && status === 'success' && !props.isEmpty"
      class="mt-6 flex justify-center md:hidden"
    >
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
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { collectionTabs } from '~/components/modules/collection/config/collection-type-config';
import type { CollectionType } from '~~/types/collection';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import LfxCollectionCardLoading from '~/components/shared/components/collection-card-loading.vue';
import LfxCollectionsEmpty from '~/components/shared/components/collections-empty.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { showToast } = useToastService();
const props = withDefaults(
  defineProps<{
    type: CollectionType;
    status?: 'pending' | 'success' | 'error' | 'idle';
    error?: Error | null;
    errorMessage?: string;
    isEmpty?: boolean;
    mobileLayout?: 'cards' | 'list';
  }>(),
  {
    status: 'success',
    error: null,
    errorMessage: 'Error fetching collections',
    isEmpty: false,
    mobileLayout: 'cards',
  },
);

const emit = defineEmits<{
  created: [];
}>();
const allTabs = computed(() => collectionTabs(user.value));
const currentTab = computed(() => allTabs.value.find((tab) => tab.type === props.type));

const title = computed(() => currentTab.value?.detailsLabel || '');
const subtitle = computed(() => currentTab.value?.description || '');
const icon = computed(() => currentTab.value?.icon || '');
const iconBackground = computed(() => currentTab.value?.iconHighlightClass || '');
const viewAllRoute = computed(() => currentTab.value?.route || '');

const gridClasses = computed(() => {
  if ((props.isEmpty && props.status === 'success') || props.status === 'error') {
    return 'mt-8';
  }
  const mobileGap = props.mobileLayout === 'cards' ? 'gap-6' : '';
  return `mt-8 flex flex-col ${mobileGap} md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6`;
});

const handleCreated = () => {
  emit('created');
};

watch(
  () => props.error,
  (err) => {
    if (err) {
      setTimeout(() => {
        showToast(`${props.errorMessage}`, ToastTypesEnum.negative, undefined, 10000);
      }, 500);
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionSection',
};
</script>
