<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="org-projects-header">
      <h2 class="text-heading-5 font-bold font-secondary">
        Overview of Critical Projects {{ orgDisplayName }} Contributors Are Involved In
      </h2>
      <span class="org-projects-sort-label">
        Sorted by technical influence
        <lfx-tooltip placement="top">
          <lfx-icon
            name="circle-info"
            :size="12"
            class="org-influence-info"
          />
          <template #content>
            <ul class="org-influence-tooltip">
              <li>
                Technical influence examines code activities (commits, PRs) while ecosystem influence examines non-code
                collaboration activities (documentation, committees, meetings, events).
              </li>
              <li>
                Comparing a company's share of these activities to the project total indicates greater influence in the
                project.
              </li>
            </ul>
          </template>
        </lfx-tooltip>
      </span>
    </div>
    <div
      v-if="isLoading"
      class="org-projects-grid"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="c-card org-project-card"
      >
        <lfx-skeleton
          height="100%"
          width="100%"
        />
      </div>
    </div>
    <div
      v-else-if="projects?.length"
      class="org-projects-grid"
    >
      <nuxt-link
        v-for="project in sortedProjects"
        :key="project.projectSlug"
        :to="`/project/${project.projectSlug}`"
        class="c-card org-project-card"
      >
        <div class="org-project-left">
          <p class="font-medium org-project-name">
            {{ project.projectName }}
          </p>
          <lfx-organization-logo
            :src="project.projectLogo"
            size="large"
            :alt="project.projectName"
          />
        </div>
        <div class="org-project-info">
          <div class="org-influence">
            <div
              class="org-influence-bars"
              :class="influenceClass(project.technicalInfluence)"
            >
              <span class="org-bar org-bar-1" />
              <span class="org-bar org-bar-2" />
              <span class="org-bar org-bar-3" />
            </div>
            <span class="org-influence-label">{{ influenceLabel(project.technicalInfluence) }}</span>
          </div>
          <div class="org-project-stat">
            <lfx-icon
              name="users"
              :size="11"
              class="org-stat-icon"
            />
            <span>{{ formatNumber(project.contributorCount) }} Code Contributors</span>
          </div>
          <div class="org-project-stat">
            <lfx-icon
              name="bolt"
              :size="11"
              class="org-stat-icon"
            />
            <span>{{ formatNumber(project.activityCount) }} Activities</span>
          </div>
        </div>
      </nuxt-link>
    </div>
    <div
      v-else
      class="org-empty"
    >
      No project data available.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import type { OrganizationProject } from '~~/types/organization-page';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const route = useRoute();
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'This Organization');
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
.org-projects-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.org-projects-sort-label {
  font-size: 0.75rem;
  color: #94a3b8;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.org-projects-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.org-project-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.15s,
    transform 0.15s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

.org-project-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.org-project-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
  margin-left: auto;
}

.org-project-name {
  font-size: 0.875rem;
  color: #0f172a;
  text-align: right;
}

.org-influence {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.org-influence-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
}

.org-influence-info {
  font-size: 0.75rem;
  color: #64748b;
  cursor: help;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.org-influence-tooltip {
  margin: 0;
  padding: 0 0 0 1.25rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  max-width: 22rem;

  li + li {
    margin-top: 0.5rem;
  }
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

.org-project-stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.org-stat-icon {
  font-size: 0.75rem;
}

.org-empty {
  color: #94a3b8;
  font-size: 0.875rem;
  padding: 2rem 0;
  text-align: center;
}
</style>
