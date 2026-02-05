<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-4 md:pt-12 flex md:gap-10 gap-5 md:flex-row flex-col-reverse">
    <div class="md:w-3/4 w-full">
      <lfx-card class="pt-4 sm:pt-6">
        <div class="px-4 sm:px-6 flex justify-between items-start pb-4 sm:pb-5 flex-wrap gap-2">
          <div class="w-full sm:w-1/2 md:w-1/2">
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
          <div class="flex items-center gap-4">
            <lfx-tooltip
              v-if="isRepository && currentRepoUrl"
              placement="top"
            >
              <template #content>
                <p class="font-bold text-xs">Repository updates can’t be processed immediately</p>
                <p class="text-xs text-neutral-300">Assessment results will be updated within an hour.</p>
              </template>
              <lfx-button
                type="tertiary"
                size="small"
                button-style="pill"
                class="whitespace-nowrap"
                :disabled="isUpdatingResults"
                @click="handleUpdateResultsClick"
              >
                <lfx-spinner
                  v-if="isUpdatingResults"
                  :size="14"
                  class="mr-1"
                />
                <lfx-icon
                  v-else
                  name="arrows-rotate-reverse"
                  :size="12"
                />
                Update results
              </lfx-button>
            </lfx-tooltip>
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
      </lfx-card>

      <div class="flex items-center justify-center mt-8">
        <lfx-repos-exclusion-footer
          v-if="hasSelectedArchivedRepos && !isFetching"
          page-content="security"
        />
        <!-- Generate YAML and Update buttons -->
        <div
          v-if="!isFetching && data?.length && !allArchived"
          class="flex items-center gap-2 px-1.5"
        >
          <p
            v-if="hasSelectedArchivedRepos && !isFetching"
            class="text-neutral-500 text-xs font-semibold"
          >
            ・
          </p>
        </div>
      </div>
    </div>

    <div class="md:w-1/4 w-full">
      <lfx-card
        class="p-5 bg-gradient-to-b from-brand-50 to-white to-30% flex flex-col justify-center items-start gap-5"
      >
        <div class="flex md:flex-col flex-row justify-center items-start gap-5">
          <div class="relative inline-block">
            <lfx-icon
              name="file"
              :size="32"
              class="text-brand-500"
            />
            <div
              class="bg-brand-500 text-icon-label font-bold absolute bottom-0 w-[75%] py-0.5 text-white text-center ml-1"
            >
              YAML
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold text-neutral-900">YAML security file</span>
            <p class="text-xs text-neutral-600">
              Generate a security metadata file to enable automated security assessments and provide clear contact
              information of your GitHub repository.
            </p>
          </div>
        </div>

        <lfx-button
          type="tertiary"
          size="small"
          button-style="pill"
          class="flex justify-center w-full"
          @click="handleGenerateYamlClick"
        >
          Generate YAML
        </lfx-button>
      </lfx-card>
    </div>
  </div>
  <lf-security-generate-yaml-modal
    v-if="isGenerateYamlModalOpen"
    v-model="isGenerateYamlModalOpen"
    @update:model-value="handleGenerateYamlUpdate"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, ref } from 'vue';
import pluralize from 'pluralize';
import { storeToRefs } from 'pinia';
import { securityParamsGetter, securityParamsSetter } from '../services/project.query.service';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
import LfxProjectSecurityEvaluationSection from '~/components/modules/project/components/security/evaluation-section.vue';
import LfxProjectSecurityEvaluationAssesment from '~/components/modules/project/components/security/evaluation-assesment.vue';
import LfxProjectSecurityPaginatedEvalRepos from '~/components/modules/project/components/security/paginated-eval-repos.vue';
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
import { SECURITY_API_SERVICE } from '~/components/modules/project/services/security.api.service';
import { useQueryParam } from '~/components/shared/utils/query-param';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

const accordion = ref('');

const route = useRoute();
const { name } = route.params;

const { queryParams } = useQueryParam(securityParamsGetter, securityParamsSetter);
const { generateYaml } = queryParams.value;
const isGenerateYamlModalOpen = ref(generateYaml === 'true' || false);

const { selectedReposValues, allArchived, archivedRepos, hasSelectedArchivedRepos } = storeToRefs(useProjectStore());

const isRepository = computed(() => !!name);
const isUpdatingResults = ref(false);

const { showToast } = useToastService();

// Get the current repository URL for security update
const currentRepoUrl = computed(() => {
  if (!isRepository.value || !selectedReposValues.value?.length) return '';
  return selectedReposValues.value[0];
});

const handleUpdateResultsClick = async () => {
  if (!currentRepoUrl.value || isUpdatingResults.value) return;

  isUpdatingResults.value = true;

  try {
    await SECURITY_API_SERVICE.triggerSecurityUpdate(route.params.slug as string, {
      repoUrl: currentRepoUrl.value || '',
    });
    showToast(
      '<span class="text-neutral-300">Repository updates can’t be processed immediately.<br>Assessment results will be updated within an hour.</span>',
      ToastTypesEnum.positive,
      '',
      5000,
      {
        title: 'Controls assessement results updated',
      },
    );
  } catch (error) {
    console.error('Failed to trigger security update:', error);
    showToast('An error occurred while triggering the update', ToastTypesEnum.negative, 'circle-exclamation', 5000, {
      summary: 'Failed to update results',
    });
  } finally {
    isUpdatingResults.value = false;
  }
};

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value || undefined,
}));

const { data, suspense, error, isFetching } = SECURITY_API_SERVICE.fetchSecurityAssessment(params);

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

const handleGenerateYamlClick = () => {
  isGenerateYamlModalOpen.value = true;
  queryParams.value = {
    generateYaml: 'true',
  };
};

const handleGenerateYamlUpdate = (value: boolean) => {
  queryParams.value = {
    generateYaml: value ? 'true' : undefined,
  };
};

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityView',
};
</script>
