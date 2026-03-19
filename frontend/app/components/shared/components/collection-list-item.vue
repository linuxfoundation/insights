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
          v-if="props.collection.logoUrl"
          :src="props.collection.logoUrl"
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
        <collection-owner
          :collection="props.collection"
          by-prefix="Curated "
        />

        <span class="text-neutral-600 text-sm"> ・ </span>

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
        <div
          v-if="showLikeCount && isLfInsightsTeamMember"
          class="ml-4"
        >
          <like-button
            :collection="props.collection"
            :variant="props.variant"
            @updated="handleLikeUpdated"
          />
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
          <template v-if="props.variant === 'my-collections' && isLfInsightsTeamMember">
            <lfx-dropdown-item @click="handleEditCollection()">
              <lfx-icon
                name="pencil"
                :size="16"
                class="text-neutral-600"
              />
              Edit
            </lfx-dropdown-item>
          </template>
          <lfx-dropdown-item @click="handleShare()">
            <lfx-icon
              name="share-nodes"
              :size="16"
              class="text-neutral-600"
            />
            Share
          </lfx-dropdown-item>
          <lfx-dropdown-item @click="handleClone()">
            <lfx-icon
              name="clone"
              :size="16"
              class="text-neutral-600"
            />
            Duplicate
          </lfx-dropdown-item>
          <template v-if="props.variant === 'my-collections' && isLfInsightsTeamMember">
            <lfx-dropdown-item @click="handleDeleteCollection()">
              <lfx-icon
                name="trash"
                :size="16"
                class="text-neutral-600"
              />
              Delete
            </lfx-dropdown-item>
          </template>
        </lfx-dropdown>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { useRouter } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection } from '~~/types/collection';
import { formatDate } from '~/components/shared/utils/formatter';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LikeButton from '~/components/shared/components/like-button.vue';
import CollectionOwner from '~/components/shared/components/collection-owner.vue';
import type { CollectionType } from '~~/types/collection';
import { useEditCollectionStore } from '~/components/modules/collection/store/edit-collection.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { useDuplicateCollectionStore } from '~/components/modules/collection/store/duplicate-collection.store';

const router = useRouter();
const { user } = storeToRefs(useAuthStore());
const { openShareModal } = useShareStore();
const { openEditModal } = useEditCollectionStore();
const { openDuplicateModal } = useDuplicateCollectionStore();
const { showToast } = useToastService();
const emit = defineEmits<{
  (e: 'updated', collection: Collection | null): void;
}>();
const props = withDefaults(
  defineProps<{
    collection: Collection;
    showLikeCount?: boolean;
    variant?: CollectionType;
  }>(),
  {
    showLikeCount: false,
    variant: 'curated',
  },
);

const isLfInsightsTeamMember = computed(() => user.value?.isLfInsightsTeamMember || false);

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

const handleEditCollection = () => {
  openEditModal({
    collection: props.collection,
    onUpdated: (collection: Collection) => {
      emit('updated', collection);
    },
  });
};

const handleClone = () => {
  openDuplicateModal({
    collection: props.collection,
  });
};

const handleDeleteCollection = async () => {
  try {
    await COLLECTIONS_API_SERVICE.deleteCollection(props.collection.id);
    showToast('Collection deleted successfully', ToastTypesEnum.positive);
    emit('updated', null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete collection';
    showToast(message, ToastTypesEnum.negative);
  }
};

const handleLikeUpdated = (collection: Collection) => {
  emit('updated', collection);
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItem',
};
</script>
