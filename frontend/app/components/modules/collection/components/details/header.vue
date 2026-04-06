<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div :style="headerBackgroundStyle">
    <section
      class="container"
      :class="scrollTop > 50 ? 'py-3 md:py-5' : ' py-5'"
    >
      <div
        :class="scrollTop > 50 ? 'h-0 opacity-0' : 'h-10 sm:h-0 p-px sm:p-0 opacity-100'"
        class="transition-all overflow-hidden ease-linear"
      >
        <nuxt-link
          :to="{ name: collectionTab?.route }"
          class="block sm:hidden"
        >
          <lfx-button
            type="tertiary"
            size="small"
            icon="fa fa-angle-left fa-light"
            :label="collectionTab?.detailsLabel"
            class="!rounded-full"
          />
        </nuxt-link>
      </div>
      <div
        class="transition-all ease-linear flex"
        :class="scrollTop > 50 ? 'flex-row gap-4 items-center' : 'flex-col'"
      >
        <div
          class="transition-all"
          :class="scrollTop > 50 ? 'mb-0' : 'mb-6'"
        >
          <nuxt-link
            :to="{ name: collectionTab?.route }"
            class="ease-linear transition-all items-center gap-1.5"
            :class="scrollTop > 50 ? 'flex' : 'hidden sm:flex'"
          >
            <div
              :class="scrollTop > 50 ? 'opacity-100 visible' : 'opacity-0 sm:opacity-100 invisible sm:visible pr-0'"
              class="transition-all ease-linear"
            >
              <lfx-icon
                name="angle-left"
                class="text-neutral-500"
                :size="16"
              />
            </div>
            <div
              class="text-sm text-neutral-500 font-medium transition-all"
              :class="scrollTop > 50 ? 'hidden' : 'block'"
            >
              {{ collectionTab?.detailsLabel }}
            </div>
          </nuxt-link>
        </div>
        <div class="flex justify-between gap-x-5 md:gap-x-15 flex-grow flex-col lg:flex-row items-start">
          <div
            class="flex-grow flex"
            :class="scrollTop > 50 ? 'gap-4' : 'gap-8'"
          >
            <div
              v-if="props.collection?.logoUrl"
              class="shrink-0"
            >
              <img
                :src="props.collection?.logoUrl"
                alt="Collection image"
                :class="scrollTop > 50 ? 'h-10 w-10' : 'h-30 w-auto'"
              />
            </div>
            <div class="w-full flex flex-col justify-center">
              <lfx-skeleton
                v-if="loading"
                height="2rem"
                width="25rem"
                class="rounded-sm"
              />
              <h1
                v-else-if="props.collection"
                class="font-secondary font-light transition-all"
                :class="scrollTop > 50 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'"
              >
                {{ props.collection.name }}
              </h1>
              <div
                :class="scrollTop > 50 ? 'h-0 opacity-0 invisible pt-0' : 'h-auto opacity-100 visible'"
                class="w-full transition-all ease-linear"
              >
                <lfx-skeleton
                  v-if="loading"
                  height="1.25rem"
                  width="100%"
                  class="rounded-sm"
                />
                <p
                  v-else-if="props.collection"
                  class="text-body-2 md:text-body-1 text-neutral-500"
                >
                  {{ props.collection.description }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="props.collection && !loading"
            class="flex transition-all ease-linear gap-4 w-full lg:w-auto shrink-0"
          >
            <template v-if="!!user">
              <lfx-tooltip content="Duplicate collection">
                <lfx-icon-button
                  icon="clone"
                  type="outline"
                  @click="handleClone"
                />
              </lfx-tooltip>
              <lfx-button
                v-if="props.type === CollectionTypeEnum.MY_COLLECTIONS"
                type="outline"
                class="!rounded-full"
                @click="handleEdit"
              >
                <lfx-icon name="pencil" />
                Edit Collection
              </lfx-button>
              <like-button
                v-else
                :collection="props.collection"
                button-type="outline"
                class="!rounded-full"
              />
            </template>
            <lfx-button
              type="outline"
              class="!rounded-full"
              @click="handleShare"
            >
              <lfx-icon name="share-nodes" />
              Share
            </lfx-button>

            <lfx-dropdown
              v-if="props.type === CollectionTypeEnum.MY_COLLECTIONS"
              placement="bottom-end"
              :class="isDeleting ? 'opacity-50 cursor-not-allowed' : ''"
              :disabled="isDeleting"
            >
              <template #trigger>
                <lfx-icon-button
                  icon="ellipsis"
                  type="transparent"
                  class="!text-neutral-900"
                />
              </template>
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
      </div>

      <div
        class="flex items-center gap-2 justify-between w-full"
        :class="scrollTop > 50 ? 'h-0 opacity-0 invisible pt-0' : 'h-auto opacity-100 visible mt-10'"
      >
        <div class="flex items-center gap-2">
          <collection-owner
            v-if="props.collection"
            :collection="props.collection"
          />

          <span
            v-if="projectCount > 0"
            class="text-neutral-600"
            >・</span
          >
          <lfx-icon
            v-if="projectCount > 0"
            name="laptop-code"
            :size="16"
            class="text-neutral-600"
          />
          <p
            v-if="projectCount > 0"
            class="text-sm leading-5 text-neutral-600"
          >
            {{ pluralize('project', projectCount, true) }}
            <span v-if="props.collection?.updatedAt">
              ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM yyyy') }}
            </span>
          </p>
        </div>
        <lfx-toggle v-model="isOnlyLFProjects"> Only Linux Foundation projects </lfx-toggle>
      </div>
    </section>
    <section class="container py-5 text-neutral-500 text-xs font-semibold">
      <div class="flex items-center gap-2">
        <div
          class="w-3/12 cursor-pointer group flex items-center gap-1"
          @click="handleSort('name')"
        >
          Project
          <lfx-icon
            name="caret-large-down"
            type="solid"
            :class="[sortIconClass('name')]"
          />
        </div>
        <div class="w-2/12 group flex items-center gap-1">Health Score</div>
        <div
          class="w-1/12 cursor-pointer group flex items-center gap-1"
          @click="handleSort('contributorCount')"
        >
          Contributors
          <lfx-icon
            name="caret-large-down"
            type="solid"
            :class="[sortIconClass('contributorCount')]"
          />
        </div>
        <!-- TODO: Enable sorting by software value when backend is ready-->
        <div class="w-1/12">Software value</div>
        <!-- Contributor/Organization dependency -->
        <div class="w-3/12">Contributor/Organization dependency</div>
        <div class="w-2/12">Achievements</div>
      </div>
    </section>
  </div>

  <!-- Full-page loading overlay for delete operation -->
  <teleport to="body">
    <div
      v-if="isDeleting"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50"
    >
      <lfx-spinner
        :size="48"
        class="text-white"
      />
      <p class="mt-4 text-white text-sm font-medium">Deleting collection...</p>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'nuxt/app';
import { useQueryClient } from '@tanstack/vue-query';
import pluralize from 'pluralize';
import { collectionTabs, headerBackground, CollectionTypeEnum } from '../../config/collection-type-config';
import type { Collection } from '~~/types/collection';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useScroll from '~/components/shared/utils/scroll';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import CollectionOwner from '~/components/shared/components/collection-owner.vue';
import { formatDate } from '~/components/shared/utils/formatter';
import LfxToggle from '~/components/uikit/toggle/toggle.vue';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { CollectionType } from '~~/types/collection';
import LikeButton from '~/components/shared/components/like-button.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { useEditCollectionStore } from '~/components/modules/collection/store/edit-collection.store';
import { useDuplicateCollectionStore } from '~/components/modules/collection/store/duplicate-collection.store';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import { useConfirmStore } from '~/components/shared/modules/confirm/store/confirm.store';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import useToastService from '~/components/uikit/toast/toast.service';

const { openEditModal } = useEditCollectionStore();
const { openDuplicateModal } = useDuplicateCollectionStore();
const { openConfirmModal } = useConfirmStore();
const { showToast } = useToastService();
const queryClient = useQueryClient();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const router = useRouter();
const { openShareModal } = useShareStore();

const props = defineProps<{
  collection?: Collection;
  loading?: boolean;
  onlyLfProjects: boolean;
  sort: string;
  type?: CollectionType;
}>();

const emit = defineEmits<{
  (e: 'update:onlyLfProjects', value: boolean): void;
  (e: 'update:sort', value: string): void;
  (e: 'updated', value: Collection): void;
}>();

const isOnlyLFProjects = computed({
  get: () => props.onlyLfProjects,
  set: (value: boolean) => {
    emit('update:onlyLfProjects', value);
  },
});

const { scrollTop } = useScroll();
const allTabs = computed(() => collectionTabs(user.value));

const collectionTab = computed(() => allTabs.value.find((tab) => tab.type === props.type) || allTabs.value[0]);
const headerBackgroundStyle = computed(() => headerBackground(props.type, props.collection?.color));

const projectCount = computed(() => (props.collection?.projectCount || 0) + (props.collection?.repositoryCount || 0));

const currentSort = computed(() => {
  const match = props.sort.match(/^(.+)_(asc|desc)$/);
  if (match) {
    return { field: match[1], direction: match[2] as 'asc' | 'desc' };
  }
  return { field: props.sort, direction: 'asc' as const };
});

const isDeleting = ref(false);

const handleSort = (field: string) => {
  const defaultDirections: Record<string, 'asc' | 'desc'> = {
    name: 'asc',
    contributorCount: 'desc',
    organizationCount: 'desc',
  };

  if (currentSort.value.field === field) {
    const newDirection = currentSort.value.direction === 'asc' ? 'desc' : 'asc';
    emit('update:sort', `${field}_${newDirection}`);
  } else {
    const direction = defaultDirections[field] || 'asc';
    emit('update:sort', `${field}_${direction}`);
  }
};

const sortIconClass = (field: string) => {
  const isActive = currentSort.value.field === field;
  const isAscending = currentSort.value.direction === 'asc';

  return [
    isActive ? 'text-neutral-500' : 'text-neutral-300 invisible group-hover:visible',
    isActive && isAscending ? 'rotate-180' : '',
  ];
};

const handleShare = () => {
  const title = `LFX Insights | Collections - ${props.collection?.name}`;

  const resolvedRoute = router.resolve({
    name: LfxRoutes.COLLECTION,
    params: { slug: props.collection?.slug },
  });
  const url = new URL(resolvedRoute.href, window.location.origin);

  openShareModal({
    url: url.toString(),
    title,
    area: props.collection?.name,
  });
};

const handleEdit = () => {
  if (props.collection) {
    openEditModal({
      collection: props.collection,
      onUpdated: (collection: Collection) => {
        emit('updated', collection);
      },
    });
  }
};

const handleClone = () => {
  if (props.collection) {
    openDuplicateModal({
      collection: props.collection,
    });
  }
};

const handleDelete = () => {
  if (props.collection && !isDeleting.value) {
    try {
      openConfirmModal({
        title: 'Delete collection',
        message: `Are you sure you want to delete this collection?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      }).then(async (result) => {
        if (result) {
          isDeleting.value = true;
          await COLLECTIONS_API_SERVICE.deleteCollection(props.collection!.id);

          invalidateMyCollections();
          isDeleting.value = false;
          router.push({ name: LfxRoutes.COLLECTIONS_MY_COLLECTIONS });
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete collection';
      showToast(message, ToastTypesEnum.negative);
    } finally {
      isDeleting.value = false;
    }
  }
};

const invalidateMyCollections = () => {
  queryClient.invalidateQueries({
    queryKey: [TanstackKey.MY_COLLECTIONS],
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHeader',
};
</script>
