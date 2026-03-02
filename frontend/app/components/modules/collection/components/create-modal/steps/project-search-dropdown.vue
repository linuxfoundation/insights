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
        ref="searchInputRef"
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
      ref="dropdownRef"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-99 max-h-[24rem] overflow-auto"
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
      <template v-else-if="searchResults.length > 0">
        <!-- Projects header -->
        <div class="px-3 pt-2 pb-1">
          <p class="text-xs font-semibold text-neutral-400 leading-5">Projects</p>
        </div>

        <!-- Project items -->
        <div
          v-for="project in searchResults"
          :key="project.slug"
          class="flex items-center justify-between px-3 py-2 rounded-md mx-1 cursor-pointer transition-colors"
          :class="isSelected(project.slug) ? 'bg-neutral-50' : 'hover:bg-neutral-50'"
          @click="toggleProject(project)"
        >
          <div class="flex items-center gap-2">
            <div
              class="size-4 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center"
            >
              <img
                v-if="project.logo"
                :src="project.logo"
                :alt="project.name"
                class="size-full object-contain"
              />
              <lfx-icon
                v-else
                name="folder"
                :size="10"
                class="text-neutral-400"
              />
            </div>
            <span class="text-sm font-normal text-neutral-900 leading-5">{{ project.name }}</span>
          </div>
          <lfx-button
            v-if="!isSelected(project.slug)"
            type="ghost"
            size="small"
            class="!font-medium"
            @click.stop="addProject(project)"
          >
            <lfx-icon
              name="plus"
              :size="12"
            />
            Add
          </lfx-button>
          <lfx-icon
            v-else
            name="check"
            :size="14"
            class="text-positive-500"
          />
        </div>
      </template>

      <!-- No results -->
      <div
        v-else
        class="flex items-center justify-center py-8"
      >
        <p class="text-sm text-neutral-500">No projects found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import type { SearchProject } from '~~/types/search';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const props = defineProps<{
  selectedSlugs: string[];
}>();

const emit = defineEmits<{
  add: [project: SearchProject];
  toggle: [project: SearchProject];
}>();

const { showToast } = useToastService();

const containerRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const searchResults = ref<SearchProject[]>([]);
const loading = ref(false);
const showDropdown = ref(false);

const isSelected = (slug: string) => {
  return props.selectedSlugs.includes(slug);
};

const addProject = (project: SearchProject) => {
  emit('add', project);
};

const toggleProject = (project: SearchProject) => {
  emit('toggle', project);
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showDropdown.value = false;
};

const fetchSearchResults = async () => {
  if (searchQuery.value.length === 0) {
    searchResults.value = [];
    return;
  }

  loading.value = true;
  try {
    searchResults.value = await COLLECTIONS_API_SERVICE.searchProjects(searchQuery.value);
  } catch {
    showToast('Error searching projects', ToastTypesEnum.negative);
    searchResults.value = [];
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
});
</script>

<script lang="ts">
export default {
  name: 'LfProjectSearchDropdown',
};
</script>
