<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 flex-1 min-h-0">
    <!-- Search input with dropdown -->
    <lf-project-search-dropdown
      :selected-projects-slugs="selectedProjectsSlugs"
      :selected-repositories-slugs="selectedRepositoriesSlugs"
      @add-project="addProject"
      @add-repository="addRepository"
    />

    <!-- Selected projects list -->
    <lf-selected-projects-list
      v-if="model.projects.length > 0 || model.repositories.length > 0"
      :projects="model.projects"
      :repositories="model.repositories"
      @remove-project="removeProject"
      @remove-repository="removeRepository"
    />

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col gap-5 items-center justify-center py-10"
    >
      <lfx-icon
        name="grid-round-2-plus"
        :size="60"
        class="text-neutral-300"
      />
      <div class="flex flex-col gap-2 items-center text-center">
        <p class="text-sm font-semibold leading-5 text-neutral-900">Add projects to your collection</p>
        <p class="text-xs font-normal leading-4 text-neutral-500">
          Add at least 1 project in order to create the collection
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { minLength } from '@vuelidate/validators';
import LfProjectSearchDropdown from './project-search-dropdown.vue';
import LfSelectedProjectsList from './selected-projects-list.vue';
import type { SearchProject, SearchRepository } from '~~/types/search';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type {
  CreateCollectionForm,
  CollectionProject,
  CollectionRepository,
} from '~/components/modules/collection/config/create-collection.config';

const props = defineProps<{
  modelValue: CreateCollectionForm;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: CreateCollectionForm): void }>();

const model = computed<CreateCollectionForm>({
  get: () => props.modelValue,
  set: (value: CreateCollectionForm) => emit('update:modelValue', value),
});

const selectedProjectsSlugs = computed(() => model.value.projects.map((p) => p.slug));
const selectedRepositoriesSlugs = computed(() => model.value.repositories.map((r) => r.slug));

const addProject = (item: SearchProject) => {
  if (!selectedProjectsSlugs.value.includes(item.slug)) {
    const collectionProject: CollectionProject = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      logo: item.logo,
    };
    model.value.projects = [...model.value.projects, collectionProject];
  }
};

const addRepository = (repository: SearchRepository) => {
  if (!selectedRepositoriesSlugs.value.includes(repository.slug)) {
    const collectionRepository: CollectionRepository = {
      name: repository.name,
      slug: repository.slug,
      url: repository.url,
    };
    model.value.repositories = [...model.value.repositories, collectionRepository];
  }
};

const removeProject = (slug: string) => {
  model.value.projects = model.value.projects.filter((p) => p.slug !== slug);
};

const removeRepository = (slug: string) => {
  model.value.repositories = model.value.repositories.filter((r) => r.slug !== slug);
};

const rules = {
  projects: { minLength: minLength(1) },
};

const $v = useVuelidate(rules, model);

defineExpose({ $v });
</script>

<script lang="ts">
export default {
  name: 'LfCreateCollectionStepProjects',
};
</script>
