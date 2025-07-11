<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    content-class="flex w-full justify-stretch items-stretch relative"
    show-close-button
  >
    <div class="p-1 flex flex-col gap-1 w-full">
      <lfx-project-repository-switch-item
        text="All repositories"
        icon="books"
        :selected="props.selectedRepoSlugs.length === 0"
        @click="handleSelected('all', true)"
      />
      <!-- Search input -->
      <hr>
      <label class="flex items-center justify-between px-3 py-2 gap-2">
        <lfx-icon
          name="search"
          :size="16"
          class="text-neutral-400"
        />
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          class="!outline-none !shadow-none  flex-grow text-sm text-neutral-900 leading-5"
          placeholder="Search repositories..."
          @keydown.esc="isModalOpen = false"
        >
        <lfx-icon
          v-if="search.length > 0"
          name="circle-xmark"
          :size="16"
          class="text-neutral-300 font-black cursor-pointer"
          @click="search = ''"
        />
      </label>

      <hr>
      <!-- Result -->
      <div class="flex flex-col gap-1 max-h-[29.5rem] overflow-y-auto">
        <lfx-project-repository-switch-item
          v-for="repository of result"
          :key="repository.url"
          :text="repository.name"
          icon="book"
          :selected="selectedRepos.includes(repository.slug)"
          is-multi-select
          @update:selected="handleSelected(repository.slug, $event)"
        />
        <section
          v-if="result.length === 0"
          class="px-3 py-12 flex flex-col items-center"
        >
          <lfx-icon
            name="face-monocle"
            :size="40"
            class="text-neutral-300"
          />
          <p class="pt-5 text-sm leading-5 text-neutral-500 text-center">
            We couldn’t find any repository with that term. Please try again.
          </p>
        </section>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import {
computed, onMounted, ref
} from "vue";
import {storeToRefs} from "pinia";
import { useRouter, useRoute } from "vue-router";
import type {ProjectRepository} from "~~/types/project";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxProjectRepositorySwitchItem
  from "~/components/modules/project/components/shared/header/repository-switch-item.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  modelValue: boolean;
  selectedRepoSlugs: string[];
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void, 
  (e: 'update:selectedRepoSlugs', value: string[]): void}>();

const route = useRoute();
const router = useRouter();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const searchInputRef = ref(null);
const search = ref('');
const selectedRepos = computed<string[]>({
  get: () => props.selectedRepoSlugs,
  set: (value: string[]) => {
    handleReposChange(value);
    emit('update:selectedRepoSlugs', value);
  }
});

const {projectRepos} = storeToRefs(useProjectStore());

const result = computed<ProjectRepository[]>(() => projectRepos.value
    .filter((repository: ProjectRepository) => repository.name.toLowerCase().includes(search.value.toLowerCase())));

const routeName = computed<{ project: LfxRoutes, repo: LfxRoutes }>(() => {
  const mapping: Record<string, { project: LfxRoutes, repo: LfxRoutes }> = {
    contributors: {
      project: LfxRoutes.PROJECT_CONTRIBUTORS,
      repo: LfxRoutes.REPOSITORY_CONTRIBUTORS,
    },
    popularity: {
      project: LfxRoutes.PROJECT_POPULARITY,
      repo: LfxRoutes.REPOSITORY_POPULARITY,
    },
    development: {
      project: LfxRoutes.PROJECT_DEVELOPMENT,
      repo: LfxRoutes.REPOSITORY_DEVELOPMENT,
    },
    security: {
      project: LfxRoutes.PROJECT_SECURITY,
      repo: LfxRoutes.REPOSITORY_SECURITY,
    },
  };

  const type: string = route.name.split('-').at(-1);

  return mapping[type] ?? {
    project: LfxRoutes.PROJECT,
    repo: LfxRoutes.REPOSITORY,
  };
});

const handleReposChange = (value: string[]) => {
  const routeQuery = route.query;
  if (value.length === 1) {
    router.push({
      name: routeName.value.repo,
      params: { name: value[0] },
      query: { ...routeQuery, repos: undefined }
    });
  } else {
    router.push({
      name: routeName.value.project,
      query: value.length > 0
        ? { ...routeQuery, repos: value.join('|') }
        : { ...routeQuery, repos: undefined }
    });
  }
};

onMounted(() => {
  searchInputRef.value?.focus();
});

const handleSelected = (slug: string, selected: boolean) => {
  if (slug === 'all' && selected) {
    selectedRepos.value = [];
    isModalOpen.value = false;
    return;
  }

  if (selected) {
    selectedRepos.value = [...selectedRepos.value, slug];
  } else {
    selectedRepos.value = selectedRepos.value.filter((repo) => repo !== slug);
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySwitch'
};
</script>
