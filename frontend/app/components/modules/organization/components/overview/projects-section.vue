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
      <template v-else-if="projects?.length">
        <div class="lfx-table has-hover">
          <div class="lfx-table-header px-1.5 border-b border-neutral-200 pb-3 mb-2 !hidden sm:!flex">
            <div class="flex-[2]">Project</div>
            <div class="flex-1">Code contributors</div>
            <div class="flex-1">Activities</div>
            <div class="w-5" />
          </div>

          <nuxt-link
            v-for="project in projects"
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
const orgId = route.params.orgId as string;

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_PROJECTS, orgId]);

const { data: projects, isLoading } = useQuery<OrganizationProject[]>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchProjects(orgId),
});
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
</style>
