<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    :disabled="totalCount === 0"
    placement="bottom-start"
    :spacing="8"
  >
    <lfx-button
      v-if="totalCount > 0"
      type="ghost"
      button-style="pill"
      class="!text-neutral-600 !font-medium"
    >
      <lfx-icon name="rectangle-history" />
      Featured in {{ pluralize('collection', totalCount, true) }}
    </lfx-button>

    <lfx-button
      v-else
      type="ghost"
      button-style="pill"
      class="!text-neutral-900 !font-medium"
      @click="handleOpenAddToCollectionModal"
    >
      <lfx-icon
        name="rectangle-history-circle-plus"
        type="light"
        :size="16"
      />
      <span>Add to collection</span>
    </lfx-button>
    <template #content="{ close }">
      <lfx-featured-in-collection-dropdown
        :collections="collections"
        :public-count="publicCount"
        :private-count="privateCount"
        @add-to-collection="handleAddToCollection(close)"
      />
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import pluralize from 'pluralize';
import LfxFeaturedInCollectionDropdown from './featured-in-collection-dropdown.vue';
import { PROJECT_API_SERVICE } from '~/components/modules/project/services/project.api.service';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useAuth } from '~~/composables/useAuth';
import { useAddToCollectionStore } from '~/components/modules/collection/store/add-to-collection.store';
import type { Project } from '~~/types/project';

const props = withDefaults(
  defineProps<{
    project: Project;
    repositories?: { name: string; path: string; url: string }[];
  }>(),
  {
    repositories: undefined,
  },
);

const { isAuthenticated, login } = useAuth();
const { openModal } = useAddToCollectionStore();

const singleRepo = computed(() => (props.repositories?.length === 1 ? props.repositories[0] : undefined));
const hasMultipleRepos = computed(() => (props.repositories?.length ?? 0) > 1);

const repoUrl = computed(() => singleRepo.value?.url || '');
const projectRepoUrls = computed(() => props.project.repositories?.map((r) => r.url) ?? []);

const { data: projectData } = PROJECT_API_SERVICE.fetchProjectCollections(props.project.slug, projectRepoUrls);
const { data: repoData } = PROJECT_API_SERVICE.fetchRepositoryCollections(repoUrl);

const data = computed(() => (singleRepo.value ? repoData.value : projectData.value));

const collections = computed(() => data.value?.collections || []);
const publicCount = computed(() => data.value?.publicCount || 0);
const privateCount = computed(() => data.value?.privateCount || 0);
const totalCount = computed(() => (hasMultipleRepos.value ? 0 : publicCount.value + privateCount.value));

const handleAddToCollection = (close: () => void) => {
  close();

  handleOpenAddToCollectionModal();
};

const handleOpenAddToCollectionModal = () => {
  if (!isAuthenticated.value) {
    login();
    return;
  }

  openModal({
    project: {
      id: props.project.id,
      name: props.project.name,
      slug: props.project.slug,
      logo: props.project.logo,
    },
    repositories: props.repositories,
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectFeaturedInCollection',
};
</script>
