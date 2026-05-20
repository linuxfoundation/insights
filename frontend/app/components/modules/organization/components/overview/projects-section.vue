<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="p-5">
      <!-- Card header -->
      <div class="flex flex-wrap gap-3 items-center mb-5">
        <div
          class="size-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <lfx-icon
            name="laptop-code"
            :size="20"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-heading-5 font-bold font-secondary">Critical Projects</h2>
          <p class="text-xs text-neutral-500 mt-0.5">{{ orgDisplayName }} contributors are involved in</p>
        </div>
        <span class="w-full sm:w-auto text-xs text-neutral-500 flex items-center gap-1.5 sm:flex-shrink-0">
          <lfx-icon
            name="arrow-down-wide-short"
            :size="12"
          />
          Sorted by
          <lfx-tooltip placement="top">
            <span class="border-b border-dotted border-neutral-500 cursor-help">Technical influence</span>
            <template #content>
              <div class="flex flex-col gap-2 max-w-xs text-xs leading-relaxed">
                <span
                  >Technical influence examines code activities (commits, PRs) while ecosystem influence examines
                  non-code collaboration activities (documentation, committees, meetings, events).</span
                >
                <span
                  >Comparing a company's share of these activities to the project total indicates greater influence in
                  the project.</span
                >
              </div>
            </template>
          </lfx-tooltip>
        </span>
      </div>

      <!-- Loading -->
      <template v-if="isLoading">
        <div class="lfx-table">
          <div class="lfx-table-header px-1.5 border-b border-neutral-200 pb-3 mb-2 !hidden sm:!flex">
            <div class="flex-[2]">Project</div>
            <div class="flex-1">Technical influence</div>
            <div class="flex-1">Code contributors</div>
            <div class="flex-1">Activities</div>
            <div class="w-5" />
          </div>
          <div
            v-for="i in 6"
            :key="i"
            class="lfx-table-row px-1.5"
          >
            <div class="flex items-center gap-3 flex-[2]">
              <lfx-skeleton class="!w-8 !h-8 !rounded-sm flex-shrink-0" />
              <lfx-skeleton class="!w-36 !h-4" />
            </div>
            <lfx-skeleton class="flex-1 !h-4 !w-20" />
            <lfx-skeleton class="flex-1 !h-4 !w-14" />
            <lfx-skeleton class="flex-1 !h-4 !w-10" />
            <div class="w-5" />
          </div>
        </div>
      </template>

      <!-- Table -->
      <template v-else-if="allProjects?.length">
        <div class="lfx-table has-hover">
          <div class="lfx-table-header px-1.5 border-b border-neutral-200 pb-3 mb-2 !hidden sm:!flex">
            <div class="flex-[2]">Project</div>
            <div class="flex-1 flex items-center gap-1">
              Technical influence
              <lfx-tooltip placement="top">
                <lfx-icon
                  name="circle-question"
                  :size="11"
                  class="cursor-help text-neutral-400"
                />
                <template #content>
                  <div class="flex flex-col gap-2 max-w-xs text-xs leading-relaxed">
                    <span
                      >Technical influence examines code activities (commits, PRs) while ecosystem influence examines
                      non-code collaboration activities (documentation, committees, meetings, events).</span
                    >
                    <span
                      >Comparing a company's share of these activities to the project total indicates greater influence
                      in the project.</span
                    >
                  </div>
                </template>
              </lfx-tooltip>
            </div>
            <div class="flex-1">Code contributors</div>
            <div class="flex-1">Activities</div>
            <div class="w-5" />
          </div>

          <nuxt-link
            v-for="project in allProjects"
            :key="project.projectSlug"
            :to="`/project/${project.projectSlug}`"
            class="lfx-table-row no-underline !text-neutral-900 border-b border-neutral-100 last:border-b-0"
          >
            <!-- Project: logo + name -->
            <div class="flex items-center gap-3 flex-1 sm:flex-[2] min-w-0 overflow-hidden">
              <div class="org-project-logo-wrap flex-shrink-0 flex items-center">
                <lfx-organization-logo
                  :src="project.projectLogo"
                  size="large"
                  :alt="project.projectName"
                />
              </div>
              <span class="font-medium text-xs sm:text-sm truncate min-w-0">{{ project.projectName }}</span>
            </div>

            <!-- Data columns: inline group on mobile, transparent on sm+ -->
            <div class="flex flex-row gap-3 items-center flex-shrink-0 sm:contents">
              <!-- Technical influence -->
              <div class="sm:flex-1 flex items-center gap-1.5">
                <div
                  v-if="computeInfluence(project.technicalScore)"
                  class="flex items-center gap-1.5 cursor-default"
                >
                  <div
                    class="org-influence-bars"
                    :class="influenceClass(computeInfluence(project.technicalScore))"
                  >
                    <span class="org-bar org-bar-1" />
                    <span class="org-bar org-bar-2" />
                    <span class="org-bar org-bar-3" />
                  </div>
                  <span class="text-xs sm:text-sm">{{ influenceLabel(computeInfluence(project.technicalScore)) }}</span>
                </div>
                <span
                  v-else
                  class="text-neutral-400 text-xs"
                  >—</span
                >
              </div>

              <!-- Code contributors -->
              <div class="sm:flex-1 text-xs sm:text-sm flex items-center gap-2">
                <lfx-icon
                  name="people-group"
                  :size="14"
                  class="text-neutral-500 flex-shrink-0 org-row-icon"
                />
                {{ formatNumber(project.contributorCount) }}
              </div>

              <!-- Activities -->
              <div class="sm:flex-1 text-xs sm:text-sm flex items-center gap-2">
                <lfx-icon
                  name="code"
                  :size="14"
                  class="text-neutral-500 flex-shrink-0 org-row-icon"
                />
                {{ formatNumber(project.activityCount) }}
              </div>
            </div>

            <!-- Chevron — hidden on mobile -->
            <span class="hidden sm:flex w-5 flex-shrink-0 items-center justify-center">
              <lfx-icon
                name="angle-right"
                :size="16"
                class="text-neutral-400"
              />
            </span>
          </nuxt-link>
        </div>

        <lfx-button
          v-if="hasNextPage"
          type="transparent"
          button-style="pill"
          :loading="isFetchingNextPage"
          class="mt-4 w-full justify-center"
          @click="fetchNextPage()"
        >
          View more
        </lfx-button>
      </template>

      <!-- Empty -->
      <div
        v-else
        class="flex items-center justify-center py-8 text-neutral-400 text-sm"
      >
        No project data available.
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import type { TechnicalInfluence } from '~~/types/organization-page';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const route = useRoute();
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'This organization');
const orgId = route.params.orgId as string;

const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
  ORGANIZATION_PAGE_API_SERVICE.fetchProjects(orgId);

const allProjects = computed(() => (data.value?.pages ?? []).flatMap((page) => page.data));

function computeInfluence(score: number | undefined): TechnicalInfluence {
  if (score === undefined) return 'silent';
  if (score >= 15) return 'leading';
  if (score >= 5) return 'contributing';
  if (score >= 1) return 'participating';
  if (score > 0) return 'silent';
  return 'silent';
}

const influenceLabel = (influence: TechnicalInfluence): string => {
  switch (influence) {
    case 'leading':
      return 'Leading';
    case 'contributing':
      return 'Contributing';
    case 'participating':
      return 'Participating';
    case 'silent':
      return 'Silent';
    default:
      return '';
  }
};

const influenceClass = (influence: TechnicalInfluence): string => {
  switch (influence) {
    case 'leading':
      return 'org-influence-leading';
    case 'contributing':
      return 'org-influence-contributing';
    case 'participating':
      return 'org-influence-participating';
    default:
      return '';
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxOrgProjectsSection',
};
</script>

<style lang="scss" scoped>
.org-project-logo-wrap {
  :deep(.c-organization-logo) {
    width: 3rem;
    height: 3rem;
  }

  @media (max-width: 767px) {
    :deep(.c-organization-logo) {
      width: 2rem !important;
      height: 2rem !important;
      overflow: hidden;
    }

    :deep(.p-avatar),
    :deep(.p-avatar-image) {
      width: 2rem !important;
      height: 2rem !important;
      min-width: 2rem !important;
    }

    :deep(img) {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain;
    }
  }
}

@media (max-width: 767px) {
  .org-row-icon {
    font-size: 11px !important;
  }
}

.has-hover .lfx-table-row {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}

.org-influence-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.org-bar {
  width: 3px;
  border-radius: 1px;
  background-color: #e2e8f0;
}

.org-bar-1 {
  height: 5px;
}

.org-bar-2 {
  height: 9px;
}

.org-bar-3 {
  height: 14px;
}

.org-influence-leading {
  .org-bar-1,
  .org-bar-2,
  .org-bar-3 {
    background-color: #047857;
  }
}

.org-influence-contributing {
  .org-bar-1,
  .org-bar-2 {
    background-color: #0094ff;
  }
}

.org-influence-participating {
  .org-bar-1 {
    background-color: #f59e0b;
  }
}
</style>
