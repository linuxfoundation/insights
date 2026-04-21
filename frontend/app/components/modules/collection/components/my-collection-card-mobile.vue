<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link
    :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }"
    class="flex flex-col gap-3 py-4 border-b border-neutral-100"
  >
    <!-- Top row: avatar stack + visibility badge + three-dot menu -->
    <div class="flex items-center justify-between gap-2">
      <lfx-avatar-group type="project">
        <lfx-avatar
          v-for="project of collectionProjects"
          :key="project.slug"
          :src="project.logo"
          type="project"
          :aria-label="project.logo && project.name"
        />
      </lfx-avatar-group>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5">
          <lfx-icon
            :name="props.collection.isPrivate ? 'lock' : 'globe'"
            :size="12"
            :class="props.collection.isPrivate ? 'text-neutral-900' : 'text-accent-500'"
          />
          <span
            class="text-xs leading-4 font-medium"
            :class="props.collection.isPrivate ? 'text-neutral-900' : 'text-accent-500'"
          >
            {{ props.collection.isPrivate ? 'Private' : 'Public' }}
          </span>
        </span>
        <lfx-dropdown placement="bottom-end">
          <template #trigger>
            <lfx-icon-button
              icon="ellipsis"
              size="small"
              type="transparent"
              class="!text-neutral-900"
            />
          </template>
          <lfx-dropdown-item @click.stop.prevent="handleEdit">
            <lfx-icon
              name="pen"
              :size="16"
              class="text-neutral-600"
            />
            Edit
          </lfx-dropdown-item>
          <lfx-dropdown-item @click.stop.prevent="handleShare">
            <lfx-icon
              name="share-nodes"
              :size="16"
              class="text-neutral-600"
            />
            Share
          </lfx-dropdown-item>
          <lfx-dropdown-item @click.stop.prevent="handleDelete">
            <lfx-icon
              name="trash"
              :size="16"
              class="!text-negative-500"
            />
            <span class="text-negative-500">Delete</span>
          </lfx-dropdown-item>
        </lfx-dropdown>
      </div>
    </div>

    <!-- Name + description -->
    <div>
      <h3 class="text-base leading-6 font-semibold text-neutral-900 mb-1 truncate">
        {{ props.collection.name }}
      </h3>
      <p class="text-xs leading-4 text-neutral-500 line-clamp-2">
        {{ props.collection.description }}
      </p>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection, CollectionFeaturedProject } from '~~/types/collection';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import { useEditCollectionStore } from '~/components/modules/collection/store/edit-collection.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const router = useRouter();
const { openShareModal } = useShareStore();
const { openEditModal } = useEditCollectionStore();
const { showToast } = useToastService();

const props = defineProps<{
  collection: Collection;
}>();

const emit = defineEmits<{
  deleted: [id: string];
  updated: [collection: Collection];
}>();

const collectionProjects = computed<CollectionFeaturedProject[]>(() => {
  return props.collection.featuredProjects.slice(0, 5);
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

const handleEdit = () => {
  openEditModal({
    collection: props.collection,
    onUpdated: (collection: Collection) => {
      emit('updated', collection);
    },
  });
};

const handleDelete = async () => {
  try {
    await COLLECTIONS_API_SERVICE.deleteCollection(props.collection.id);
    showToast('Collection deleted successfully', ToastTypesEnum.positive);
    emit('deleted', props.collection.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete collection';
    showToast(message, ToastTypesEnum.negative);
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxMyCollectionCardMobile',
};
</script>
