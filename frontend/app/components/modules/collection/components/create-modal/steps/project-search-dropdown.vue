<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <!-- Search input -->
    <label class="c-input !rounded-full flex items-center gap-2 !px-3">
      <lfx-icon
        name="search"
        :size="14"
        class="text-neutral-400"
      />
      <input
        v-model="searchQuery"
        type="text"
        class="!outline-none !shadow-none flex-grow text-sm text-neutral-900 leading-5 !pl-0"
        placeholder="Search projects & repositories"
        @input="triggerSearch"
        @focus="showDropdown = true"
      />
      <lfx-icon
        v-if="searchQuery.length > 0"
        name="circle-xmark"
        :size="16"
        type="solid"
        class="text-neutral-300 cursor-pointer"
        @click="clearSearch"
      />
    </label>

    <!-- Search results dropdown -->
    <div
      v-if="showDropdown && searchQuery.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-99 max-h-[19rem] overflow-auto"
    >
      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-8"
      >
        <lfx-spinner
          :size="32"
          class="text-neutral-300"
        />
      </div>

      <!-- Results -->
      <lf-collection-search-results
        v-if="projects.length > 0 || repositories.length > 0"
        :selected-projects-slugs="selectedProjectsSlugs"
        :selected-repositories-slugs="selectedRepositoriesSlugs"
        :projects="projects"
        :repositories="repositories"
        @add-project="addProject"
        @add-repository="addRepository"
      />

      <!-- No results -->
      <div
        v-else
        class="flex items-center justify-center py-8"
      >
        <p class="text-sm text-neutral-500">No projects or repositories found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import LfCollectionSearchResults from './collection-search-results.vue';
import type { SearchProject, SearchRepository } from '~~/types/search';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

defineProps<{
  selectedProjectsSlugs: string[];
  selectedRepositoriesSlugs: string[];
}>();

const emit = defineEmits<{
  addProject: [project: SearchProject];
  addRepository: [repository: SearchRepository];
}>();

const { showToast } = useToastService();

const containerRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const projects = ref<SearchProject[]>([]);
const repositories = ref<SearchRepository[]>([]);
const loading = ref(false);
const showDropdown = ref(false);

const addProject = (project: SearchProject) => {
  emit('addProject', project);
  clearSearch();
};

const addRepository = (repository: SearchRepository) => {
  emit('addRepository', repository);
  clearSearch();
};

const clearSearch = () => {
  searchQuery.value = '';
  projects.value = [];
  repositories.value = [];
  showDropdown.value = false;
};

const fetchSearchResults = async () => {
  if (searchQuery.value.length === 0) {
    projects.value = [];
    repositories.value = [];
    return;
  }

  loading.value = true;
  try {
    const results = await COLLECTIONS_API_SERVICE.searchProjectsAndRepositories(searchQuery.value);
    projects.value = results.projects;
    repositories.value = results.repositories;
  } catch {
    showToast('Error searching projects', ToastTypesEnum.negative);
    projects.value = [];
    repositories.value = [];
  } finally {
    loading.value = false;
  }
};

const triggerSearch = debounce(fetchSearchResults, 300);

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;

  if (!showDropdown.value) return;

  const isOutsideContainer = containerRef.value && !containerRef.value.contains(target);

  if (isOutsideContainer) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  triggerSearch.cancel();
});
</script>

<script lang="ts">
export default {
  name: 'LfProjectSearchDropdown',
};
</script>
