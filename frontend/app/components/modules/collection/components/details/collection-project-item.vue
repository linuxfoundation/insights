<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center gap-2 py-4 text-neutral-900 text-sm cursor-pointer hover:bg-neutral-50 transition-all duration-300 px-2 -mx-2"
    @click="navigateToItem"
  >
    <div class="flex items-center gap-3 w-3/12 font-semibold">
      <lfx-organization-logo
        :src="props.project.logoUrl || ''"
        :is-lf="props.project.isLF"
        :alt="props.project.name"
      />
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-1">
          <template v-if="props.project.type === 'repo'">
            {{ props.project.name }}
          </template>
          <template v-else>
            {{ nameDisplay }}
          </template>
          <lfx-archived-tag
            v-if="status === 'archived'"
            :archived="true"
            label="Archived"
            type="project"
          />
        </div>
        <div
          v-if="props.project.type === 'repo'"
          class="text-neutral-500 font-normal flex gap-1.5 items-center min-w-0"
        >
          <lfx-icon
            name="book"
            :size="12"
            class="shrink-0"
          />
          <span class="truncate">{{ repoShortUrl }}</span>
        </div>
      </div>
    </div>
    <template v-if="isOnboarded">
      <div class="w-2/12">
        <lfx-popover
          placement="top"
          trigger-event="hover"
          :allow-pass-through="true"
        >
          <lfx-health-score :score="project.healthScore" />
          <template #content>
            <lfx-health-score-details :project="props.project" />
          </template>
        </lfx-popover>
      </div>
      <div class="w-1/12">
        {{ formatNumber(props.project.contributorCount) }}
      </div>
      <div class="w-1/12">${{ formatNumberShort(props.project.softwareValue || 0) }}</div>
      <div class="w-3/12">
        <lfx-popover
          placement="top"
          trigger-event="hover"
          :allow-pass-through="true"
        >
          <lfx-dependency-column :project="props.project" />
          <template #content>
            <lfx-dependency-details :project="props.project" />
          </template>
        </lfx-popover>
      </div>
      <div class="w-2/12">
        <template v-if="props.project.type === 'repo'">
          <span class="text-neutral-400">-</span>
        </template>
        <lfx-badge-details
          v-else
          :project="props.project"
        />
      </div>
    </template>
    <template v-else>
      <div class="w-2/12 text-neutral-400">-</div>
      <div class="w-1/12 text-neutral-400">-</div>
      <div class="w-1/12 text-neutral-400">-</div>
      <div class="w-3/12 text-neutral-400">-</div>
      <div class="w-2/12 text-neutral-400">-</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ProjectInsights } from '~~/types/project';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxHealthScore from '~/components/shared/components/health-score.vue';
import LfxHealthScoreDetails from '~/components/modules/collection/components/details/health-score-details.vue';
import LfxDependencyColumn from '~/components/modules/collection/components/details/dependency-column.vue';
import LfxDependencyDetails from '~/components/modules/collection/components/details/dependency-details.vue';
import LfxBadgeDetails from '~/components/modules/collection/components/details/badge-details.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { getRepoNameFromUrl, getRepoSlugFromName } from '~~/server/helpers/repository.helpers';
import { normalizeRepoName } from '~/components/shared/utils/helper';

const props = defineProps<{
  project: ProjectInsights;
}>();

const router = useRouter();

const status = computed(() => {
  return props.project.status;
});

const repoShortUrl = computed(() => {
  if (props.project.type === 'repo') {
    return getRepoNameFromUrl(props.project.repoUrl);
  }
  return '';
});

const nameDisplay = computed(() => {
  if (props.project.type === 'repo') {
    const splitName = normalizeRepoName({
      url: props.project.repoUrl,
      name: '',
      slug: '',
      score: 0,
      rank: 0,
    }).split('/');
    return splitName.length > 0 ? splitName[splitName.length - 1] : props.project.repoUrl;
  }
  return props.project.name;
});

const isOnboarded = computed(() => {
  return props.project.contributorCount > 0 || props.project.organizationCount > 0;
});

const navigateToItem = () => {
  if (props.project.type === 'repo') {
    const repoName = getRepoNameFromUrl(props.project.repoUrl);
    const repoSlug = getRepoSlugFromName(repoName);
    router.push({
      name: LfxRoutes.REPOSITORY,
      params: { slug: props.project.slug, name: repoSlug },
    });
  } else {
    router.push({ name: LfxRoutes.PROJECT, params: { slug: props.project.slug } });
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionProjectItem',
};
</script>
