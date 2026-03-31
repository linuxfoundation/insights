<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }">
    <lfx-card class="!shadow-none !rounded-xl !border-neutral-200 flex flex-col hover:!shadow-md transition h-full">
      <!-- header: cover image for curated collections -->
      <div
        v-if="props.collection.imageUrl && props.variant === 'curated'"
        class="flex items-center gap-2 h-[120px] rounded-t-xl bg-cover bg-center"
        :style="{ backgroundImage: `url(${props.collection.imageUrl})` }"
      ></div>
      <!-- header: avatar stack for community/my-collections or curated without cover image -->
      <div
        v-else
        class="flex items-center gap-2 p-4 min-h-16 rounded-t-xl"
        :class="{ 'justify-between': props.variant === 'my-collections' }"
        :style="headerBackground"
      >
        <lfx-avatar-group type="project">
          <lfx-avatar
            v-for="project of collectionProjects"
            :key="project.slug"
            :src="project.logo"
            type="project"
            :aria-label="project.logo && project.name"
          />
        </lfx-avatar-group>
        <lfx-dropdown
          v-if="props.variant === 'my-collections'"
          placement="bottom-end"
        >
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
              class="text-negative-500"
            />
            <span class="text-negative-500">Delete</span>
          </lfx-dropdown-item>
        </lfx-dropdown>
      </div>

      <!-- content -->
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-base leading-6 font-semibold text-neutral-900 mb-1 truncate">
          {{ props.collection.name }}
        </h3>
        <p class="text-xs leading-4 text-neutral-500 line-clamp-2 mb-6">
          {{ props.collection.description }}
        </p>

        <div class="mt-auto">
          <!-- owner info - different display based on variant -->
          <div
            v-if="props.variant !== 'my-collections'"
            class="flex items-center gap-2 mb-2"
          >
            <collection-owner
              :collection="props.collection"
              size="small"
            />
          </div>

          <!-- project count and updated date -->
          <div class="flex items-center gap-1.5">
            <lfx-icon
              name="laptop-code"
              :size="12"
              class="text-neutral-500"
            />
            <p
              v-if="props.collection"
              class="text-xs leading-4 text-neutral-500"
            >
              {{ props.collection.projectCount }} projects
              <span v-if="props.collection.updatedAt">
                ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM') }}
              </span>
              <template v-if="props.variant === 'my-collections'"> ・ </template>
            </p>
            <!-- visibility badge for my-collections -->
            <span
              v-if="props.variant === 'my-collections'"
              class="flex items-center gap-1.5"
            >
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
          </div>

          <!-- footer actions - not shown for my-collections -->
          <div
            v-if="props.variant !== 'my-collections'"
            class="pt-3 mt-3 border-t border-neutral-200 grid grid-cols-3 gap-2"
          >
            <lfx-tooltip
              content="Share collection"
              class="!w-full"
            >
              <lfx-button
                type="ghost"
                button-style="pill"
                class="w-full justify-center items-center opacity-50 hover:!opacity-100"
                @click.stop.prevent="handleShare"
              >
                <div class="p-0.5">
                  <lfx-icon
                    name="share-nodes"
                    :size="16"
                    class="!text-neutral-900"
                  />
                </div>
              </lfx-button>
            </lfx-tooltip>
            <template v-if="!!user">
              <lfx-tooltip
                content="Duplicate collection"
                class="!w-full"
              >
                <lfx-button
                  type="ghost"
                  button-style="pill"
                  class="w-full justify-center items-center opacity-50 hover:!opacity-100"
                  @click.stop.prevent="handleClone"
                >
                  <div class="p-0.5">
                    <lfx-icon
                      name="clone"
                      :size="16"
                      class="!text-neutral-900"
                    />
                  </div>
                </lfx-button>
              </lfx-tooltip>
              <like-button
                :collection="props.collection"
                class="!w-full"
              />
            </template>
          </div>
        </div>
      </div>
    </lfx-card>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection, CollectionType } from '~~/types/collection';
import { formatDate } from '~/components/shared/utils/formatter';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxCard from '~/components/uikit/card/card.vue';
import type { CollectionFeaturedProject } from '~~/types/collection';
import CollectionOwner from '~/components/shared/components/collection-owner.vue';
import LikeButton from '~/components/shared/components/like-button.vue';
import { useEditCollectionStore } from '~/components/modules/collection/store/edit-collection.store';
import { useDuplicateCollectionStore } from '~/components/modules/collection/store/duplicate-collection.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const router = useRouter();
const { openShareModal } = useShareStore();
const { openEditModal } = useEditCollectionStore();
const { openDuplicateModal } = useDuplicateCollectionStore();
const { showToast } = useToastService();
const { user } = storeToRefs(useAuthStore());

const props = withDefaults(
  defineProps<{
    collection: Collection;
    variant?: CollectionType;
  }>(),
  {
    variant: 'curated',
  },
);

const emit = defineEmits<{
  deleted: [id: string];
  updated: [collection: Collection];
}>();

// This only applies to the collection card header, in the designs the header gradient seems to be different
// from the card background gradient for communinity and my collections
const headerBackground = computed(() => {
  if (props.variant === 'curated') {
    // curated collections should have an image so we don't need a background
    // however, if the image is not set, we need to use a default background
    if (props.collection.imageUrl) {
      return {};
    }

    if (props.collection.color) {
      return {
        background: `linear-gradient(0deg, ${props.collection.color}00, ${props.collection.color}0D), var(--White, #FFF)`,
      };
    }
  }

  // community and my-collections (curated too if no image and no color)
  return {
    background: 'linear-gradient(0deg, #F8FBFF00, #F8FBFF)',
  };
});

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

const handleClone = () => {
  openDuplicateModal({
    collection: props.collection,
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
  name: 'LfxCollectionCard',
};
</script>
