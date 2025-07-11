<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    content-class="flex w-full justify-stretch items-stretch"
  >
    <div class="p-1 flex flex-col gap-1 w-full">

      <nuxt-link
        :to="{ name: routeName.project }"
      >
        <lfx-project-repository-switch-item
          text="All repositories"
          icon="books"
          :selected="!props.repo"
        />
      </nuxt-link>
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
        <nuxt-link
          v-for="repository of result"
          :key="repository.url"
          :to="{ name: routeName.repo, params: {name: repository.slug}}"
        >
          <lfx-project-repository-switch-item
            :text="repository.name"
            icon="books"
            :selected="props.repo === repository.slug"
          />
        </nuxt-link>
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
computed, onMounted, ref, watch
} from "vue";
import {storeToRefs} from "pinia";
import type {ProjectRepository} from "~~/types/project";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxProjectRepositorySwitchItem
  from "~/components/modules/project/components/shared/header/repository-switch-item.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  modelValue: boolean;
  repo: string;
}>();
const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void }>();

const route = useRoute();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const searchInputRef = ref(null);
const search = ref('');

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

watch(() => route.path, () => {
  isModalOpen.value = false;
});

onMounted(() => {
  searchInputRef.value?.focus();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySwitch'
};
</script>
