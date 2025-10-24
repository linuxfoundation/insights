<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-4 md:pt-12">
    <lfx-card class="pt-4 sm:pt-6">
      <div class="px-4 sm:px-6 flex justify-between items-start pb-4 sm:pb-5">
        <div>
          <!-- Title -->
          <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
            <h1 class="text-heading-3 font-secondary font-bold">Controls assessment</h1>
            <lfx-tag
              variation="warning"
              size="small"
            >
              Alpha version
            </lfx-tag>
          </div>

          <!-- Description -->
          <p class="text-xs text-neutral-500">
            Process of assessing a project's practices, policies, and technical measures against a set of predefined
            standards to determine its security posture, reliability, and maturity.
            <a
              :href="links.securityScore"
              class="text-brand-500"
              target="_blank"
              rel="noopener noreferrer"
              >Learn more</a
            >
          </p>
        </div>
        <!-- Generate YAML and Update buttons -->
        <div
          v-if="!isFetching && data?.length && !allArchived"
          class="flex items-center gap-2"
        >
          <lfx-tooltip
            v-if="!PROJECT_SECURITY_SERVICE.hasSecurityMdFile(data || [])"
            placement="top"
          >
            <lfx-button
              type="transparent"
              size="small"
              button-style="pill"
              class="whitespace-nowrap !hidden lg:!flex"
              @click="isGenerateYamlModalOpen = true"
            >
              <lfx-icon name="file-shield" />
              Generate YAML file
            </lfx-button>

            <template #content>
              <div class="flex flex-col gap-1 max-w-72">
                <div class="font-semibold text-white text-xs">YAML Security specifications file</div>
                <div class="text-neutral-300 text-xs">
                  Generate a YAML security file, upload it to your repository, and ensure we can run all security
                  assessments for your project.
                </div>
              </div>
            </template>
          </lfx-tooltip>
          <!-- TODO: Enable when backend is ready -->
          <!--          <lfx-button-->
          <!--            type="tertiary"-->
          <!--            size="small"-->
          <!--            button-style="pill"-->
          <!--            class="whitespace-nowrap"-->
          <!--          >-->
          <!--            <lfx-icon name="arrows-rotate-reverse" />-->
          <!--            Update results-->
          <!--          </lfx-button>-->
        </div>
      </div>

      <!-- Disclaimer for aggregated view -->
      <div
        v-if="!isRepository"
        class="px-6 py-3 bg-neutral-50 border-y border-neutral-100 flex items-center gap-1.5 rounded-b-lg"
      >
        <lfx-icon
          name="info-circle"
          :size="14"
          class="text-neutral-500"
        />
        <p class="text-body-2 text-neutral-500 font-semibold">
          You’re viewing an aggregated score and controls assessment for the entire project. For a detailed analysis,
          choose a specific repository.
        </p>
      </div>
      <div class="px-4 sm:px-6 pt-1">
        <!-- Show spinner when loading -->
        <div
          v-if="isFetching"
          class="pt-5 border-t border-neutral-100"
        >
          <div class="flex flex-col items-center justify-center py-20">
            <lfx-spinner
              :size="40"
              type="light"
              class="text-neutral-300"
            />
            <p class="text-neutral-500 text-center text-body-1 pt-5">Loading controls assessment...</p>
          </div>
        </div>

        <!-- show if all repos are archived -->
        <lfx-empty-state
          v-else-if="allArchived"
          icon="archive"
          :title="pluralize('Archived Repository', archivedRepos.length)"
          description="Archived repositories are excluded from Health Score and Security & Best practices.
              You can still access historical data of Contributors, Popularity, or Development metrics."
        />

        <!-- Show if no data available -->
        <div
          v-else-if="data?.length === 0 || error"
          class="pt-5 border-t border-neutral-100"
        >
          <div class="flex flex-col items-center justify-center py-20">
            <lfx-icon
              name="eyes"
              class="text-neutral-300"
              :size="40"
            />
            <p class="text-neutral-500 text-center text-body-1 pt-5">
              No data available to perform controls assessment
            </p>
          </div>
        </div>
        <div v-else>
          <!-- Display checks -->
          <lfx-accordion v-model="accordion">
            <lfx-project-security-evaluation-section
              v-for="(checks, title) in groupedData"
              :key="title"
              :name="title"
              :checks="checks"
              :tooltip="isRepository ? 'Category success rate' : 'Average category success rate of all repositories'"
            >
              <template v-if="isRepository">
                <template
                  v-for="check in checks"
                  :key="check.controlId"
                >
                  <lfx-project-security-evaluation-assesment
                    v-for="assessment in check.assessments"
                    :key="assessment.requirementId"
                    :assessment="assessment"
                  />
                </template>
              </template>
              <template v-else>
                <lfx-project-security-paginated-eval-repos :group-checks="groupChecksByRepository(checks || [])" />
              </template>
            </lfx-project-security-evaluation-section>
          </lfx-accordion>
        </div>
      </div>
      <lfx-repos-exclusion-footer
        v-if="hasSelectedArchivedRepos && !isFetching"
        class="mt-3"
        page-content="security"
      />
    </lfx-card>
  </div>
  <lf-security-generate-yaml-modal
    v-if="isGenerateYamlModalOpen"
    v-model="isGenerateYamlModalOpen"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, ref } from 'vue';
import pluralize from 'pluralize';
import { storeToRefs } from 'pinia';
import { type QueryFunction, useQuery } from '@tanstack/vue-query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
// import LfxProjectSecurityOspsScore from "~/components/modules/project/components/security/osps-score.vue";
import LfxProjectSecurityEvaluationSection from '~/components/modules/project/components/security/evaluation-section.vue';
import LfxProjectSecurityEvaluationAssesment from '~/components/modules/project/components/security/evaluation-assesment.vue';
import LfxProjectSecurityPaginatedEvalRepos from '~/components/modules/project/components/security/paginated-eval-repos.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { SecurityData } from '~~/types/security/responses.types';
import { links } from '~/config/links';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { PROJECT_SECURITY_SERVICE } from '~/components/modules/project/services/security.service';
import LfxReposExclusionFooter from '~/components/shared/components/repos-exclusion-footer.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfSecurityGenerateYamlModal from '~/components/modules/project/components/security/yaml/generate-yaml-modal.vue';

const accordion = ref('');

const route = useRoute();
const { name } = route.params;

const isGenerateYamlModalOpen = ref(false);

const { selectedReposValues, allArchived, archivedRepos, hasSelectedArchivedRepos } = storeToRefs(useProjectStore());

const isRepository = computed(() => !!name);

const queryKey = computed(() => [TanstackKey.SECURITY_ASSESSMENT, route.params.slug, selectedReposValues.value]);

const fetchData: QueryFunction<SecurityData[]> = async () =>
  $fetch(`/api/project/${route.params.slug}/security/assessment`, {
    params: {
      repos: selectedReposValues.value || undefined,
    },
  });

const { data, suspense, error, isFetching } = useQuery<SecurityData[]>({
  queryKey,
  queryFn: fetchData,
});

// TODO: Remove this when we have data for them
const securityAssessmentData = computed(() => PROJECT_SECURITY_SERVICE.removeUnavailableChecks(data.value || []));

const groupedData = computed(() =>
  (securityAssessmentData.value || []).reduce(
    (mapping, check) => {
      const obj = { ...mapping };
      if (!obj[check.category]) {
        obj[check.category] = [];
      }
      const tmpAssessments = PROJECT_SECURITY_SERVICE.orderAssessmentsByRequirementId(
        PROJECT_SECURITY_SERVICE.mergeDuplicateAssessments(check.assessments),
      );
      // Create a copy of the check object to avoid mutating the original
      const checkCopy = {
        ...check,
        assessments: tmpAssessments,
      };
      obj[check.category]?.push(checkCopy);
      return obj;
    },
    {} as Record<string, SecurityData[]>,
  ),
);

const groupChecksByRepository = (checks: SecurityData[]) =>
  (checks || []).reduce(
    (mapping, check) => {
      const obj = { ...mapping };
      if (!obj[check.repo]) {
        obj[check.repo] = [];
      }
      const tmpAssessments = PROJECT_SECURITY_SERVICE.orderAssessmentsByRequirementId(
        PROJECT_SECURITY_SERVICE.mergeDuplicateAssessments(check.assessments),
      );
      // Create a copy of the check object to avoid mutating the original
      const checkCopy = {
        ...check,
        assessments: tmpAssessments,
      };
      obj[check.repo]?.push(checkCopy);
      return obj;
    },
    {} as Record<string, SecurityData[]>,
  );

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityView',
};
</script>
