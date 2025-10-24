<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
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
        class="!outline-none !shadow-none flex-grow text-sm text-neutral-900 leading-5"
        placeholder="Search repositories..."
      />
      <lfx-icon
        v-if="search.length > 0"
        name="circle-xmark"
        :size="16"
        class="text-neutral-300 font-black cursor-pointer"
        @click="search = ''"
      />
    </label>

    <hr />
    <!-- Result -->
    <div
      v-bind="containerProps"
      class="h-[29.5rem] overflow-y-auto"
    >
      <div v-bind="wrapperProps">
        <lfx-project-repository-switch-item
          v-for="{ data } in list"
          :key="data.url"
          is-multi-select
          :selected="selectedRepoSlugs.includes(data.slug)"
          @click="handleReposChange(data.slug)"
        >
          <div class="flex justify-between w-full">
            <div class="flex items-center gap-3">
              <lfx-icon
                name="book"
                class="text-neutral-400"
              />
              <p>
                {{ data.name }}
              </p>
            </div>

            <lfx-archived-tag
              v-if="data.isArchived || data.isExcluded"
              :archived="data.isArchived"
              :label="data.isArchived ? 'Archived' : 'Excluded'"
            />
          </div>
        </lfx-project-repository-switch-item>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useVirtualList } from '@vueuse/core';
import { useRoute, useRouter } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { ProjectRepository } from '~~/types/project';
import LfxProjectRepositorySwitchItem from '~/components/modules/project/components/shared/header/repository-switch/repository-switch-item.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import type { ProjectLinkConfig } from '~/components/modules/project/config/links';

const props = defineProps<{
  link: ProjectLinkConfig;
}>();

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const search = ref('');

const { selectedRepoSlugs, projectRepos, archivedRepos, excludedRepos } =
  storeToRefs(useProjectStore());

interface RepositoryItem extends ProjectRepository {
  isExcluded: boolean;
  isArchived: boolean;
}

const repositories = computed<RepositoryItem[]>(() =>
  projectRepos.value.map((repo) => ({
    ...repo,
    isExcluded: excludedRepos.value.includes(repo.url),
    isArchived: archivedRepos.value.includes(repo.url),
  })),
);

const result = computed<RepositoryItem[]>(() =>
  repositories.value.filter((repository: ProjectRepository) =>
    repository.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const { list, containerProps, wrapperProps } = useVirtualList(result, {
  itemHeight: 40,
});

const handleReposChange = (slug: string) => {
  let repos = [];
  if (selectedRepoSlugs.value.includes(slug)) {
    repos = selectedRepoSlugs.value.filter((s) => s !== slug);
  } else {
    repos = [...selectedRepoSlugs.value, slug];
  }
  const routeQuery = route.query;
  if (repos.length === 1) {
    router.push({
      name: props.link.repoRouteName,
      params: { name: repos[0] },
      query: { ...routeQuery, repos: undefined },
    });
  } else {
    router.push({
      name: props.link.projectRouteName,
      query:
        repos.length > 0
          ? { ...routeQuery, repos: repos.join(',') }
          : { ...routeQuery, repos: undefined },
    });
  }
};

onMounted(() => {
  searchInputRef.value?.focus();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySearch',
};
</script>
