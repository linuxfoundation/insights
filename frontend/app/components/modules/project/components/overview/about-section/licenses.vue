<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="activeLicenses.length > 0"
    class="flex flex-col gap-3 text-xs"
  >
    <div class="text-neutral-400 font-semibold">License(s)</div>
    <div class="flex flex-wrap gap-1.5">
      <template
        v-for="license of displayedLicenses"
        :key="license"
      >
        <lfx-tooltip
          v-if="isSharedByAllRepos(license)"
          content="License shared by all repositories"
          placement="top"
        >
          <div
            class="bg-white border border-neutral-200 h-6 rounded-full px-2.5 flex items-center gap-1 cursor-default shrink-0"
          >
            <lfx-icon
              name="scale-balanced"
              :size="12"
              class="text-neutral-500"
            />
            <span class="text-neutral-900 font-normal whitespace-nowrap">{{ license }}</span>
          </div>
        </lfx-tooltip>
        <lfx-popover
          v-else
          trigger-event="hover"
          placement="bottom-start"
          :spacing="6"
        >
          <div
            class="bg-white border border-neutral-200 h-6 rounded-full px-2.5 flex items-center gap-1 cursor-default shrink-0"
          >
            <lfx-icon
              name="scale-balanced"
              :size="12"
              class="text-neutral-500"
            />
            <span class="text-neutral-900 font-normal whitespace-nowrap">{{ license }}</span>
          </div>
          <template #content>
            <div class="bg-white border border-neutral-100 rounded-xl shadow-lg p-2 flex flex-col overflow-hidden">
              <div
                v-for="repo of getReposForLicense(license)"
                :key="repo.url"
                class="flex items-center pl-2 py-2 gap-3 w-full rounded-lg cursor-pointer hover:bg-neutral-50"
                @click="filterByRepo(repo.slug)"
              >
                <lfx-icon
                  name="book"
                  :size="12"
                  class="text-neutral-500 shrink-0"
                />
                <span
                  class="text-neutral-900 text-xs font-medium w-52 overflow-hidden text-ellipsis whitespace-nowrap pr-4"
                  >{{ repo.name }}</span
                >
              </div>
            </div>
          </template>
        </lfx-popover>
      </template>
      <button
        v-if="!isExpanded && activeLicenses.length > 5"
        class="text-xs text-brand-500 font-normal h-6 flex items-center"
        @click="isExpanded = true"
      >
        Show more
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'nuxt/app';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';

const { projectRepos, selectedRepositories } = storeToRefs(useProjectStore());
const router = useRouter();
const route = useRoute();

const isExpanded = ref(false);

const activeRepos = computed(() =>
  selectedRepositories.value.length > 0 ? selectedRepositories.value : projectRepos.value,
);

const activeLicenses = computed(() => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const repo of activeRepos.value) {
    for (const license of repo.licenses || []) {
      if (!seen.has(license)) {
        seen.add(license);
        result.push(license);
      }
    }
  }
  return result;
});

const displayedLicenses = computed(() => (isExpanded.value ? activeLicenses.value : activeLicenses.value.slice(0, 5)));

const isSharedByAllRepos = (license: string): boolean =>
  projectRepos.value.length > 0 && projectRepos.value.every((repo) => repo.licenses?.includes(license));

const getReposForLicense = (license: string) => projectRepos.value.filter((repo) => repo.licenses?.includes(license));

const filterByRepo = (repoSlug: string) => {
  router.push({ query: { ...route.query, repos: repoSlug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectLicenses',
};
</script>
