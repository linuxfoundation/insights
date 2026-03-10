<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link
    :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }"
    class="flex items-center justify-between py-4 px-2 hover:bg-neutral-50 transition border-b border-neutral-100"
  >
    <div class="flex items-center gap-3 w-1/2">
      <!-- Collection Avatar -->
      <div class="relative shrink-0">
        <lfx-avatar
          v-if="props.collection.imgUrl"
          :src="props.collection.imgUrl"
          type="project"
        />
        <div
          v-else
          class="w-8 h-8 rounded-sm border border-neutral-200 flex items-center justify-center"
        >
          <lfx-icon
            name="rectangle-history"
            :size="16"
            class="text-neutral-400"
          />
        </div>
      </div>

      <!-- Collection Info -->
      <div class="flex flex-col min-w-0 flex-1">
        <h4 class="text-sm font-medium text-neutral-900 truncate">
          {{ props.collection.name }}
        </h4>
        <p class="text-xs text-neutral-500 truncate">
          {{ props.collection.description }}
        </p>
      </div>
    </div>

    <!-- Right side info -->
    <div class="flex items-center gap-4 shrink-0">
      <!-- Owner info -->
      <div class="flex items-center gap-2">
        <template v-if="props.collection.isLf">
          <img
            :src="lfIconUrl"
            alt="The Linux Foundation"
            class="w-4 h-4"
          />
          <span class="text-sm text-neutral-600"> Curated by The Linux Foundation ・ </span>
        </template>
        <template v-else-if="props.collection.owner">
          <lfx-avatar
            :src="props.collection.owner.logo"
            type="member"
            size="xsmall"
          />
          <span class="text-sm text-neutral-600"> by {{ props.collection.owner.name }} ・ </span>
        </template>

        <!-- Project count and updated date -->
        <div class="flex items-center gap-1.5">
          <lfx-icon
            name="laptop-code"
            :size="16"
            class="text-neutral-500"
          />
          <span class="text-sm text-neutral-500">
            {{ props.collection.projectCount }} projects ・ Updated
            {{ formatDate(props.collection.updatedAt, 'dd MMM') }}
          </span>
        </div>
      </div>

      <div>
        <lfx-dropdown placement="bottom-end">
          <template #trigger>
            <lfx-icon-button
              icon="ellipsis"
              size="small"
              type="transparent"
              class="!p-2"
            />
          </template>
          <lfx-dropdown-item @click="handleShare()">
            <lfx-icon
              name="share-nodes"
              :size="16"
              class="text-neutral-600"
            />
            Share
          </lfx-dropdown-item>
        </lfx-dropdown>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { useRouter } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection } from '~~/types/collection';
import { formatDate } from '~/components/shared/utils/formatter';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';

const router = useRouter();
const { openShareModal } = useShareStore();

const props = defineProps<{
  collection: Collection;
}>();

const handleShare = () => {
  const title = `LFX Insights | Collections - ${props.collection.name}`;

  const resolvedRoute = router.resolve({
    name: LfxRoutes.COLLECTION,
    params: { slug: props.collection.slug },
  });
  const url = new URL(resolvedRoute.href, window.location.origin);

  openShareModal({
    url: url.toString(),
    title,
    area: props.collection.name,
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItem',
};
</script>
