<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="p-5">
      <!-- Card header -->
      <div class="flex gap-3 items-center mb-5">
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
        <span class="text-xs text-neutral-500 flex items-center gap-1.5 flex-shrink-0">
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
          <div class="lfx-table-header px-1.5 border-b border-neutral-200 pb-3 mb-2">
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
      <template v-else-if="projects?.length">
        <div class="lfx-table has-hover">
          <div class="lfx-table-header px-1.5 border-b border-neutral-200 pb-3 mb-2">
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
            v-for="project in sortedProjects"
            :key="project.projectSlug"
            :to="`/project/${project.projectSlug}`"
            class="lfx-table-row no-underline !text-neutral-900 border-b border-neutral-100 last:border-b-0"
          >
            <!-- Project: logo + name -->
            <div class="flex items-center gap-3 flex-[2] min-w-0">
              <lfx-organization-logo
                :src="project.projectLogo"
                size="large"
                :alt="project.projectName"
                class="flex-shrink-0"
              />
              <span class="font-medium text-sm truncate">{{ project.projectName }}</span>
            </div>

            <!-- Technical influence -->
            <div class="flex-1 flex items-center gap-1.5">
              <div
                class="org-influence-bars"
                :class="influenceClass(project.technicalInfluence)"
              >
                <span class="org-bar org-bar-1" />
                <span class="org-bar org-bar-2" />
                <span class="org-bar org-bar-3" />
              </div>
              <span class="text-sm">{{ influenceLabel(project.technicalInfluence) }}</span>
            </div>

            <!-- Code contributors -->
            <div class="flex-1 text-sm flex items-center gap-2">
              <lfx-icon
                name="people-group"
                :size="14"
                class="text-neutral-500 flex-shrink-0"
              />
              {{ formatNumber(project.contributorCount) }}
            </div>

            <!-- Activities -->
            <div class="flex-1 text-sm flex items-center gap-2">
              <lfx-icon
                name="code"
                :size="14"
                class="text-neutral-500 flex-shrink-0"
              />
              {{ formatNumber(project.activityCount) }}
            </div>

            <!-- Chevron -->
            <lfx-icon
              name="angle-right"
              :size="16"
              class="text-neutral-400 flex-shrink-0 w-5"
            />
          </nuxt-link>
        </div>
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
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import type { OrganizationProject } from '~~/types/organization-page';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const route = useRoute();
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'This organization');
const orgName = route.params.orgName as string;

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_PROJECTS, orgName]);

const { data: projects, isLoading } = useQuery<OrganizationProject[]>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchProjects(orgName),
});

const influenceRank = (influence: string) => {
  switch (influence) {
    case 'leading':
      return 0;
    case 'contributing':
      return 1;
    case 'participating':
      return 2;
    default:
      return 3;
  }
};

const sortedProjects = computed(() => {
  if (!projects.value) return [];
  return [...projects.value].sort((a, b) => influenceRank(a.technicalInfluence) - influenceRank(b.technicalInfluence));
});

const influenceLabel = (influence: string) => {
  switch (influence) {
    case 'leading':
      return 'Leading';
    case 'contributing':
      return 'Contributing';
    case 'participating':
      return 'Participating';
    default:
      return influence;
  }
};

const influenceClass = (influence: string) => {
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
