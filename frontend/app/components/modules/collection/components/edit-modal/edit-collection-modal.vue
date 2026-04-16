<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="600px"
    content-class="!overflow-hidden"
    :close-function="handleCloseAttempt"
  >
    <div class="flex flex-col bg-white rounded-xl shadow-xl min-h-[60vh] max-h-[75vh]">
      <!-- Header -->
      <div class="flex flex-col gap-4 p-6 pb-0">
        <div class="flex items-center justify-between">
          <h2 class="font-secondary font-bold text-xl leading-7 text-neutral-900">Edit collection</h2>
          <lfx-icon-button
            icon="xmark"
            type="default"
            size="small"
            :icon-size="12"
            @click="closeModal"
          />
        </div>

        <!-- Tabs -->
        <lfx-tabs
          v-model="activeTab"
          :tabs="tabs"
          tab-style="pill"
        >
          <template #slotItem="{ option }">
            <div class="flex items-center gap-1.5 -mx-1">
              <lfx-icon
                :name="option.icon"
                :size="16"
              />
              {{ option.label }}
            </div>
          </template>
        </lfx-tabs>
      </div>

      <!-- Tab content (scrollable) -->
      <div class="flex-1 min-h-0 overflow-y-auto p-6">
        <lf-edit-modal-settings
          v-if="activeTab === 'settings'"
          v-model="form"
        />
        <lf-edit-modal-projects
          v-else-if="activeTab === 'projects'"
          v-model="form"
          :is-loading="isLoadingProjects"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-4 p-6 border-t border-neutral-200 shrink-0">
        <lfx-button
          type="tertiary"
          button-style="pill"
          :disabled="isUpdating"
          @click="closeModal"
        >
          Cancel
        </lfx-button>
        <lfx-button
          button-style="pill"
          :disabled="!isFormValid || isUpdating"
          @click="updateCollection"
        >
          <lfx-icon
            v-if="isUpdating"
            name="loader-circle"
            class="animate-spin"
          />
          {{ isUpdating ? 'Updating...' : 'Update' }}
        </lfx-button>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import LfEditModalSettings from './edit-modal-settings.vue';
import LfEditModalProjects from './edit-modal-projects.vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import type { Collection } from '~~/types/collection';
import type { ProjectInsights } from '~~/types/project';
import type { Pagination } from '~~/types/shared/pagination';
import type {
  CreateCollectionForm,
  CollectionProject,
  CollectionRepository,
} from '~/components/modules/collection/config/create-collection.config';

interface Tab {
  value: 'settings' | 'projects';
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { value: 'settings', label: 'Settings', icon: 'sliders-simple' },
  { value: 'projects', label: 'Projects & Repositories', icon: 'grid-round-2' },
];

const props = defineProps<{
  modelValue: boolean;
  collection: Collection | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  updated: [collection: Collection];
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const collectionProjectsParams = computed(() => ({
  slug: props.collection?.slug || '',
  pageSize: 100,
}));

const { data: collectionProjectsData, isLoading: isLoadingProjects } =
  COLLECTIONS_API_SERVICE.fetchCollectionProjects(collectionProjectsParams);

const collectionProjects = computed<ProjectInsights[]>(
  // @ts-expect-error - TanStack Query type inference issue with Vue
  () => collectionProjectsData.value?.pages.flatMap((page: Pagination<ProjectInsights>) => page.data) || [],
);

const { showToast } = useToastService();

const activeTab = ref<'settings' | 'projects'>('settings');
const isUpdating = ref(false);
const form = ref<CreateCollectionForm>({
  name: '',
  description: '',
  projects: [],
  repositories: [],
  visibility: 'private',
});
const originalForm = ref<CreateCollectionForm | null>(null);

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length > 0 &&
    form.value.description.trim().length > 0 &&
    (form.value.projects.length > 0 || form.value.repositories.length > 0)
  );
});

const hasUnsavedChanges = computed(() => {
  if (!originalForm.value) return false;

  const projectIds = form.value.projects.map((p) => p.id).sort();
  const originalProjectIds = originalForm.value.projects.map((p) => p.id).sort();

  const repositoryUrls = form.value.repositories.map((r) => r.url).sort();
  const originalRepositoryUrls = originalForm.value.repositories.map((r) => r.url).sort();

  return (
    form.value.name !== originalForm.value.name ||
    form.value.description !== originalForm.value.description ||
    form.value.visibility !== originalForm.value.visibility ||
    JSON.stringify(projectIds) !== JSON.stringify(originalProjectIds) ||
    JSON.stringify(repositoryUrls) !== JSON.stringify(originalRepositoryUrls)
  );
});

const handleCloseAttempt = (): boolean => {
  return !hasUnsavedChanges.value;
};

const closeModal = () => {
  if (originalForm.value) {
    form.value = JSON.parse(JSON.stringify(originalForm.value));
  }
  isModalOpen.value = false;
};

const initializeForm = () => {
  if (props.collection) {
    const formData: CreateCollectionForm = {
      name: props.collection.name,
      description: props.collection.description,
      projects: collectionProjects.value
        .filter((p: ProjectInsights) => p.type === 'project')
        .map(
          (p: ProjectInsights): CollectionProject => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            logo: p.logoUrl,
          }),
        ),
      repositories: collectionProjects.value
        .filter((p: ProjectInsights) => p.type === 'repo')
        .map(
          (p: ProjectInsights): CollectionRepository => ({
            name: p.name,
            slug: p.slug,
            url: p.repoUrl,
          }),
        ),
      visibility: props.collection.isPrivate ? 'private' : 'public',
    };
    form.value = formData;
    originalForm.value = JSON.parse(JSON.stringify(formData));
  }
};

const updateCollection = async () => {
  if (!isFormValid.value || isUpdating.value || !props.collection) {
    return;
  }

  const payload = {
    name: form.value.name,
    description: form.value.description,
    isPrivate: form.value.visibility === 'private',
    projects: form.value.projects.map((project) => project.id),
    repositoryUrls: form.value.repositories.map((repository) => repository.url),
  };

  isUpdating.value = true;

  try {
    const updated = await COLLECTIONS_API_SERVICE.updateCollection(props.collection.id, payload);
    showToast('Collection updated successfully', ToastTypesEnum.positive);
    emit('updated', updated);
    isModalOpen.value = false;
  } catch (error: unknown) {
    const fetchError = error as { statusCode?: number; statusMessage?: string };

    if (fetchError.statusCode === 422) {
      activeTab.value = 'settings';
      showToast(
        fetchError.statusMessage || 'Content violates our guidelines. Please revise and try again.',
        ToastTypesEnum.negative,
      );
    } else {
      const message = error instanceof Error ? error.message : 'Failed to update collection';
      showToast(message, ToastTypesEnum.negative);
    }
  } finally {
    isUpdating.value = false;
  }
};

watch(
  isModalOpen,
  (value) => {
    if (value) {
      activeTab.value = 'settings';
      initializeForm();
    }
  },
  { immediate: true },
);

watch(
  () => props.collection,
  () => {
    if (isModalOpen.value) {
      initializeForm();
    }
  },
);

watch(collectionProjects, () => {
  if (isModalOpen.value && props.collection) {
    initializeForm();
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfEditCollectionModal',
};
</script>
