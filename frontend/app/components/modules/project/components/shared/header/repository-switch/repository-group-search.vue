<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <!-- Search repository groups -->
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
        placeholder="Search repository groups..."
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
        v-for="(rg, ri) of result"
        :key="ri"
        :selected="selectedRepositoryGroup?.slug === rg.slug"
        @click="handleSelectRepositoryGroup(rg)"
      >
        <div>
          <p class="text-sm mb-1">{{rg.name}}</p>
          <div class="flex items-center gap-1.5">
            <lfx-icon
              name="book"
              class="text-neutral-500"
              :size="14"
            />
            <p class="text-xs text-neutral-500">
              {{pluralize('repository', rg.repositories.length, true)}}
            </p>
          </div>
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
          We couldn’t find any repository group with that term. Please try again.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import pluralize from "pluralize";
import {useRoute, useRouter} from "nuxt/app";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import type {ProjectRepositoryGroup} from "~~/types/project";
import LfxProjectRepositorySwitchItem
  from "~/components/modules/project/components/shared/header/repository-switch/repository-switch-item.vue";
import type {ProjectLinkConfig} from "~/components/modules/project/config/links";

const props = defineProps<{
  link: ProjectLinkConfig
}>();

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const search = ref('');

const {
  projectRepositoryGroups,
    selectedRepositoryGroup,
} = storeToRefs(useProjectStore());


const result = computed<ProjectRepositoryGroup[]>(() => projectRepositoryGroups.value
    .filter((rg: ProjectRepositoryGroup) => rg.name.toLowerCase().includes(search.value.toLowerCase())));

const handleSelectRepositoryGroup = (rg: ProjectRepositoryGroup) => {
  const routeQuery = route.query;
  router.push({
    name: props.link.repoGroupRouteName,
    params: {
      groupSlug: rg.slug
    },
    query: {...routeQuery, repos: undefined}
  })
  emit('close');
}

onMounted(() => {
  searchInputRef.value?.focus();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositoryGroupSearch'
};
</script>
