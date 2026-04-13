<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Projects section -->
  <template v-if="projects.length > 0">
    <!-- Projects header -->
    <div class="px-3 pt-2 pb-1">
      <p class="text-xs font-semibold text-neutral-400 leading-5">Projects</p>
    </div>

    <!-- Project items -->
    <div class="flex flex-col gap-1">
      <div
        v-for="project in projects"
        :key="project.slug"
        class="flex items-center justify-between px-3 py-2 rounded-md mx-1 cursor-pointer transition-colors hover:bg-neutral-50"
        @click="emit('addProject', project)"
      >
        <div class="flex items-center gap-2">
          <div
            class="size-5 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center"
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
              :size="16"
              class="text-neutral-400"
            />
          </div>
          <span class="text-sm font-normal text-neutral-900 leading-5">{{ project.name }}</span>
        </div>
        <div class="flex items-center">
          <lfx-button
            v-if="!isSelected(project.slug)"
            type="ghost"
            size="small"
            class="!font-medium !p-0"
            @click.stop="emit('addProject', project)"
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
      </div>
    </div>
  </template>

  <!-- Repositories section -->
  <template v-if="repositories.length > 0">
    <!-- Repositories header -->
    <div class="px-3 pt-2 pb-1">
      <p class="text-xs font-semibold text-neutral-400 leading-5">Repositories</p>
    </div>

    <!-- Repository items -->
    <div class="flex flex-col gap-1">
      <div
        v-for="repository in repositories"
        :key="repository.slug"
        class="flex items-center justify-between px-3 py-2 rounded-md mx-1 cursor-pointer transition-colors hover:bg-neutral-50"
        @click="emit('addRepository', repository)"
      >
        <div class="flex items-center gap-2">
          <div
            class="size-5 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center"
          >
            <lfx-icon
              name="book"
              :size="16"
              class="text-neutral-400"
            />
          </div>
          <span class="text-sm font-normal text-neutral-900 leading-5">{{ repository.name }}</span>
        </div>
        <div class="flex items-center">
          <lfx-button
            v-if="!isSelected(repository.slug)"
            type="ghost"
            size="small"
            class="!font-medium !p-0"
            @click.stop="emit('addRepository', repository)"
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
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { SearchProject, SearchRepository } from '~~/types/search';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  selectedProjectsSlugs: string[];
  selectedRepositoriesSlugs: string[];
  projects: SearchProject[];
  repositories: SearchRepository[];
}>();

const emit = defineEmits<{
  addProject: [project: SearchProject];
  addRepository: [repository: SearchRepository];
}>();

const isSelected = (slug: string) => {
  return props.selectedProjectsSlugs.includes(slug) || props.selectedRepositoriesSlugs.includes(slug);
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionSearchResults',
};
</script>
