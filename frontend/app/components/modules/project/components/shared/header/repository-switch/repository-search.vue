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
        class="!outline-none !shadow-none  flex-grow text-sm text-neutral-900 leading-5"
        placeholder="Search repositories..."
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
        is-multi-select
        :selected="false"
      >
        <div class="flex justify-between w-full">
          <div class="flex items-center gap-3">
            <lfx-icon
              name="book"
              class="text-neutral-400"
            />
            <p>
              {{repository.name}}
            </p>
          </div>

          <lfx-archived-tag
            v-if="repository.isArchived || repository.isExcluded"
            :archived="repository.isArchived"
            :label="repository.isArchived ? 'Archived' : 'Excluded'"
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
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import type {ProjectRepository} from "~~/types/project";
import LfxProjectRepositorySwitchItem
  from "~/components/modules/project/components/shared/header/repository-switch/repository-switch-item.vue";
import LfxArchivedTag from "~/components/shared/components/archived-tag.vue";

const searchInputRef = ref(null);
const search = ref('');

const {
  projectRepos,
  archivedRepos,
  excludedRepos
} = storeToRefs(useProjectStore());

interface RepositoryItem extends ProjectRepository {
  isExcluded: boolean;
  isArchived: boolean;
}

const repositories = computed<RepositoryItem[]>(() => projectRepos.value.map((repo) => ({
  ...repo,
  isExcluded: excludedRepos.value.includes(repo.url),
  isArchived: archivedRepos.value.includes(repo.url),
})));

const result = computed<RepositoryItem[]>(() => repositories.value
    .filter((repository: ProjectRepository) => repository.name.toLowerCase().includes(search.value.toLowerCase())));

onMounted(() => {
  searchInputRef.value?.focus();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySearch'
};
</script>
