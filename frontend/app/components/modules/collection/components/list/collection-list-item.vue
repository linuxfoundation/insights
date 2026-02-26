<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }">
    <div class="flex flex-row items-center py-4 px-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100">
      <div class="flex items-center gap-3 w-1/2">
        <div
          v-if="collection.imgUrl"
          class="w-8 h-8 rounded-sm"
        >
          <img
            :src="collection.imgUrl"
            :alt="collection.name"
            class="w-full"
          />
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <h3 class="text-sm font-semibold text-neutral-900">
            {{ props.collection.name }}
          </h3>
          <div class="text-xs leading-4 text-neutral-500 truncate">
            {{ props.collection.description }}
          </div>
        </div>
      </div>
      <div class="w-1/2 pl-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 mb-2">
            <img
              :src="owner.logo"
              :alt="owner.name"
              class="block"
              loading="lazy"
              width="16"
              height="16"
            />
            <p class="text-sm leading-5 text-neutral-600">
              by
              {{ owner.name }}
            </p>
            <span
              v-if="props.collection.projectCount > 0"
              class="text-neutral-600"
              >・</span
            >
            <lfx-icon
              v-if="props.collection.projectCount > 0"
              name="laptop-code"
              :size="16"
              class="text-neutral-600"
            />
            <p
              v-if="props.collection.projectCount && props.collection.projectCount > 0"
              class="text-sm leading-5 text-neutral-600"
            >
              {{ props.collection.projectCount }} projects
              <span v-if="props.collection.updatedAt">
                ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM yyyy') }}
              </span>
            </p>
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
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import type { Collection } from '~~/types/collection';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { formatDate } from '~/components/shared/utils/formatter';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';

const props = defineProps<{
  collection: Collection;
}>();

const router = useRouter();
const { openShareModal } = useShareStore();

const owner = computed(() => {
  if (props.collection.owner) {
    return {
      name: props.collection.owner?.name,
      logo: props.collection.owner?.logo,
    };
  }

  return {
    name: 'The Linux Foundation',
    logo: lfIconUrl,
  };
});

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
