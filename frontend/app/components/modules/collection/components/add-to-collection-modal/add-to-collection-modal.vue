<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="480px"
    content-class="!overflow-visible"
  >
    <div class="flex flex-col gap-8 bg-white rounded-xl shadow-xl p-6">
      <!-- Header -->
      <div class="flex gap-3">
        <div class="flex-1 flex flex-col gap-3">
          <div class="flex items-center justify-center size-12 rounded-full bg-accent-50">
            <lfx-icon
              name="rectangle-history-circle-plus"
              :size="24"
              class="text-accent-500"
            />
          </div>
          <div class="flex flex-col gap-1">
            <h2 class="font-secondary font-bold text-xl leading-7 text-neutral-900">Add to collection</h2>
            <p class="text-xs text-neutral-500">Add the selected project(s) to one of your collections.</p>
          </div>
        </div>
        <lfx-icon-button
          icon="xmark"
          type="default"
          size="small"
          :icon-size="12"
          @click="closeModal"
        />
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-6">
        <!-- Selected project -->
        <div class="flex flex-col gap-3">
          <p class="text-xs font-medium text-neutral-900">Selected projects:</p>
          <div class="flex items-center gap-3 py-2 border-y border-neutral-200">
            <lfx-avatar
              type="organization"
              size="xsmall"
              :src="props.project.logo || ''"
            />
            <div class="flex flex-col">
              <span class="text-sm font-medium text-neutral-900">{{ props.project.name }}</span>
              <span class="text-xxs text-neutral-500">All repositories</span>
            </div>
          </div>
        </div>

        <!-- Collection select -->
        <div class="flex flex-col gap-1">
          <p class="text-xs font-medium text-neutral-900">Collection <span class="text-red-500">*</span></p>
          <lfx-select
            v-model="selectedCollectionId"
            placeholder="Select a collection"
          >
            <template #prefix>
              <lfx-icon
                name="rectangle-history"
                :size="16"
                class="text-neutral-400 mr-2"
              />
            </template>
            <lfx-option
              v-for="collection in collections"
              :key="collection.id"
              :value="collection.id"
              :label="collection.name"
            />
          </lfx-select>
          <p
            v-if="collections.length === 0 && !isLoadingCollections"
            class="text-xs text-neutral-500 mt-1"
          >
            You don't have any collections yet.
            <a
              href="/collection?tab=my-collections"
              class="text-accent-500 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-4">
        <lfx-button
          type="tertiary"
          button-style="pill"
          :disabled="isAdding"
          @click="closeModal"
        >
          Cancel
        </lfx-button>
        <lfx-button
          button-style="pill"
          :disabled="!selectedCollectionId || isAdding"
          @click="addToCollection"
        >
          <lfx-icon
            v-if="isAdding"
            name="loader-circle"
            class="animate-spin"
          />
          {{ isAdding ? 'Adding...' : 'Add to collection' }}
        </lfx-button>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AddToCollectionProject } from '~/components/modules/collection/store/add-to-collection.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useAuth } from '~~/composables/useAuth';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxSelect from '~/components/uikit/select/select.vue';
import LfxOption from '~/components/uikit/select/option.vue';
import type { Collection } from '~~/types/collection';
import type { Pagination } from '~~/types/shared/pagination';

const props = defineProps<{
  modelValue: boolean;
  project: AddToCollectionProject;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  added: [];
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const { user } = useAuth();
const { showToast } = useToastService();

const selectedCollectionId = ref('');
const isAdding = ref(false);

const myCollectionsParams = computed(() => ({
  pageSize: 100,
  sort: 'createdAt_desc',
  categories: undefined,
}));

const { data: myCollectionsData, isLoading: isLoadingCollections } = COLLECTIONS_API_SERVICE.fetchMyCollections(
  myCollectionsParams,
  user,
);

const collections = computed<Collection[]>(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  const data = myCollectionsData.value?.pages.flatMap((page: Pagination<Collection>) => page.data) || [];
  if (!data) return [];
  return data;
});

const closeModal = () => {
  isModalOpen.value = false;
};

const addToCollection = async () => {
  if (!selectedCollectionId.value || isAdding.value) return;

  const collection = collections.value.find((c) => c.id === selectedCollectionId.value);

  if (!collection) return;

  isAdding.value = true;

  try {
    // Fetch existing projects in the collection
    const existingProjectsResponse = await $fetch<{ data: { id: string }[] }>(
      `/api/collection/${collection.slug}/projects`,
      { params: { pageSize: 1000 } },
    );

    const existingProjectIds = existingProjectsResponse.data.map((p) => p.id);

    // Check if project is already in the collection
    if (existingProjectIds.includes(props.project.id)) {
      showToast(`${props.project.name} is already in ${collection.name}`, ToastTypesEnum.warning);
      return;
    }

    const newProjectIds = [...existingProjectIds, props.project.id];

    await COLLECTIONS_API_SERVICE.updateCollection(collection.id, {
      name: collection.name,
      description: collection.description,
      isPrivate: collection.isPrivate,
      projects: newProjectIds,
    });

    showToast(`${props.project.name} added to ${collection.name}`, ToastTypesEnum.positive);
    emit('added');
    closeModal();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add to collection';
    showToast(message, ToastTypesEnum.negative);
  } finally {
    isAdding.value = false;
  }
};

watch(isModalOpen, (value) => {
  if (value) {
    selectedCollectionId.value = '';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxAddToCollectionModal',
};
</script>
