<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Desktop: table row (rendered when as='row') -->
  <tr
    v-if="props.as === 'row'"
    class="text-neutral-900 text-sm cursor-pointer bg-neutral-50 hover:bg-neutral-100 border-b border-neutral-200 transition-all duration-300 align-middle"
    @click="navigateToItem"
  >
    <td class="py-4 pl-5 md:pl-10 pr-2 font-semibold">
      <div class="flex items-center gap-3">
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
          <lfx-tooltip
            v-if="!!maturity.trim()"
            placement="top"
          >
            <template #content>
              <div class="flex flex-col gap-1">
                <p class="text-xs text-white">Based on CNCF Project Maturity Model</p>
                <p class="text-xs text-neutral-300">
                  From experimental (Sandbox), through growing adoption (Incubating), to production-ready (Graduated).
                </p>
              </div>
            </template>
            <div class="truncate text-neutral-500 text-xs font-normal leading-4 underline decoration-dotted">
              {{ maturity }}
            </div>
          </lfx-tooltip>
        </div>
      </div>
    </td>
    <template v-if="isOnboarded">
      <td class="py-4 px-2 whitespace-nowrap">
        <lfx-collection-lifecycle-badge :lifecycle-label="props.project.lifecycleLabel" />
      </td>
      <td class="py-4 px-2 whitespace-nowrap">
        <lfx-collection-health-score-pill
          v-if="isHealthScoreUnavailable"
          :unavailable="true"
          :score="0"
        />
        <lfx-popover
          v-else
          placement="top"
          trigger-event="hover"
          :allow-pass-through="true"
        >
          <lfx-collection-health-score-pill
            :score="project.healthScoreV2 ?? 0"
            :health-label="props.project.healthLabel"
          />
          <template #content>
            <lfx-health-score-details :project="props.project" />
          </template>
        </lfx-popover>
      </td>
      <td class="py-4 px-2 whitespace-nowrap">
        <lfx-collection-impact-score-pill
          :score="props.project.impactScore"
          :impact-label="props.project.impactLabel"
        />
      </td>
      <td class="py-4 px-2 whitespace-nowrap">
        {{ formatNumber(props.project.contributorCount) }}
      </td>
      <td class="py-4 px-2 whitespace-nowrap">
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
      </td>
      <td class="py-4 pl-2 pr-5 md:pr-10 text-right whitespace-nowrap">
        <template v-if="props.project.type === 'repo'">
          <span class="text-neutral-400">-</span>
        </template>
        <lfx-badge-details
          v-else
          :project="props.project"
        />
      </td>
    </template>
    <template v-else>
      <td class="py-4 px-2 text-neutral-400 whitespace-nowrap">-</td>
      <td class="py-4 px-2 text-neutral-400 whitespace-nowrap">-</td>
      <td class="py-4 px-2 text-neutral-400 whitespace-nowrap">-</td>
      <td class="py-4 px-2 text-neutral-400 whitespace-nowrap">-</td>
      <td class="py-4 px-2 text-neutral-400 whitespace-nowrap">-</td>
      <td class="py-4 pl-2 pr-5 md:pr-10 text-right text-neutral-400 whitespace-nowrap">-</td>
    </template>
  </tr>

  <!-- Mobile: simplified card row (rendered when as='card', the default) -->
  <div
    v-else
    class="flex items-start gap-3 py-3 px-2 -mx-2 cursor-pointer hover:bg-neutral-50 transition-all border-b border-neutral-100"
    @click="navigateToItem"
  >
    <lfx-organization-logo
      :src="props.project.logoUrl || ''"
      :is-lf="props.project.isLF"
      :alt="props.project.name"
      class="shrink-0"
    />
    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-center gap-1 text-sm font-semibold text-neutral-900">
        <span class="truncate">{{ props.project.type === 'repo' ? props.project.name : nameDisplay }}</span>
        <lfx-archived-tag
          v-if="status === 'archived'"
          :archived="true"
          label="Archived"
          type="project"
        />
      </div>
      <lfx-tooltip
        v-if="props.project.isLF && !!maturity.trim()"
        placement="top"
      >
        <template #content>
          <div class="text-xs text-white">Maturity level as defined by the Linux Foundation</div>
        </template>
        <div class="truncate text-neutral-500 text-xs font-normal leading-4 underline decoration-dotted">
          {{ maturity }}
        </div>
      </lfx-tooltip>
      <!-- Repo URL for repo type -->
      <div
        v-if="props.project.type === 'repo'"
        class="flex items-center gap-1 text-xs text-neutral-500 min-w-0"
      >
        <lfx-icon
          name="book"
          :size="11"
          class="shrink-0"
        />
        <span class="truncate">{{ repoShortUrl }}</span>
      </div>
      <div class="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 flex-wrap">
        <template v-if="isOnboarded">
          <lfx-collection-lifecycle-badge :lifecycle-label="props.project.lifecycleLabel" />
          <lfx-collection-health-score-pill
            :score="project.healthScoreV2 ?? 0"
            :health-label="props.project.healthLabel"
            :unavailable="isHealthScoreUnavailable"
          />
          <lfx-collection-impact-score-pill
            :score="props.project.impactScore"
            :impact-label="props.project.impactLabel"
          />
          <span class="text-neutral-400">・</span>
          <lfx-icon
            name="users"
            :size="12"
            class="text-neutral-500"
          />
          <span>{{ formatNumber(props.project.contributorCount) }}</span>
        </template>
        <template v-else>
          <span class="text-neutral-400">No data available</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ProjectInsights } from '~~/types/project';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxCollectionHealthScorePill from '~/components/modules/collection/components/details/collection-health-score-pill.vue';
import LfxCollectionLifecycleBadge from '~/components/modules/collection/components/details/collection-lifecycle-badge.vue';
import LfxCollectionImpactScorePill from '~/components/modules/collection/components/details/collection-impact-score-pill.vue';
import LfxHealthScoreDetails from '~/components/modules/collection/components/details/health-score-details.vue';
import LfxDependencyColumn from '~/components/modules/collection/components/details/dependency-column.vue';
import LfxDependencyDetails from '~/components/modules/collection/components/details/dependency-details.vue';
import LfxBadgeDetails from '~/components/modules/collection/components/details/badge-details.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { getRepoNameFromUrl, getRepoSlugFromName } from '~~/server/helpers/repository.helpers';
import { normalizeRepoName } from '~/components/shared/utils/helper';

const props = withDefaults(
  defineProps<{
    project: ProjectInsights;
    as?: 'row' | 'card';
  }>(),
  {
    as: 'card',
  },
);

const router = useRouter();

const status = computed(() => {
  return props.project.status;
});

const maturity = computed(() => props.project.maturity ?? '');

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

const isHealthScoreUnavailable = computed(
  () => props.project.healthScoreV2 === null || props.project.healthScoreV2 === undefined,
);

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
