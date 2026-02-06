<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-4 md:pt-10 flex flex-col gap-8">
    <div
      v-if="hasSelectedArchivedRepos && !isFetching"
      class="flex items-center justify-center gap-2"
    >
      <hr class="grow border-t border-neutral-200" />
      <lfx-repos-exclusion-footer page-content="security" />
      <hr class="grow border-t border-neutral-200" />
    </div>
    <lfx-card class="p-4 sm:p-6">
      <lfx-project-security-control-assesment-head />

      <div class="flex md:gap-8 gap-6 md:flex-row flex-col-reverse py-4">
        <div class="md:w-3/4 w-full md:border-r border-neutral-200 pr-6 sm:pr-8">
          <!-- Disclaimer for aggregated view -->
          <div
            v-if="!isRepository"
            class="p-3 bg-neutral-50 border-y border-neutral-100 flex items-center gap-1.5 rounded-md"
          >
            <lfx-icon
              name="info-circle"
              :size="14"
              class="text-neutral-500"
            />
            <p class="text-body-2 text-neutral-500 font-semibold">
              You’re viewing an aggregated score and controls assessment for the entire project. For a detailed
              analysis,
              <span
                class="cursor-pointer underline decoration-dotted"
                @click="isSearchRepoModalOpen = true"
                >choose a specific repository.</span
              >
            </p>
          </div>
          <div>
            <!-- Show spinner when loading -->
            <div
              v-if="isFetching"
              class="pt-5"
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

              <lfx-accordion
                v-if="isRepository"
                v-model="accordion"
              >
                <lfx-project-security-evaluation-section-accordion
                  v-for="(checks, title) in groupedData"
                  :key="title"
                  :title="title"
                  :checks="checks"
                  :tooltip="
                    isRepository ? 'Category success rate' : 'Average category success rate of all repositories'
                  "
                >
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
                </lfx-project-security-evaluation-section-accordion>
              </lfx-accordion>

              <template v-else>
                <lfx-project-security-evaluation-section-row
                  v-for="(checks, title) in groupedData"
                  :key="title"
                  :title="title"
                  :checks="checks"
                  :tooltip="
                    isRepository ? 'Category success rate' : 'Average category success rate of all repositories'
                  "
                  @open-repos-eval-modal="openReposEvalModal"
                />
              </template>
            </div>
          </div>
        </div>

        <div class="md:w-1/4 w-full">
          <lfx-project-security-generate-yaml-section />
        </div>
      </div>
    </lfx-card>
  </div>

  <lfx-project-repository-switch
    v-if="isSearchRepoModalOpen"
    v-model="isSearchRepoModalOpen"
  />

  <lfx-project-security-repos-eval-modal
    :model-value="isReposEvalModalOpen"
    :current-tab="currentTab"
    :checks-group="groupedData"
    @update:model-value="isReposEvalModalOpen = $event"
    @update:current-tab="currentTab = $event"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, ref } from 'vue';
import pluralize from 'pluralize';
import { storeToRefs } from 'pinia';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
// import LfxProjectSecurityOspsScore from "~/components/modules/project/components/security/osps-score.vue";
import LfxProjectSecurityEvaluationSectionRow from '~/components/modules/project/components/security/evaluation-section-row.vue';
import LfxProjectSecurityEvaluationSectionAccordion from '~/components/modules/project/components/security/evaluation-section-accordion.vue';
import LfxProjectSecurityEvaluationAssesment from '~/components/modules/project/components/security/evaluation-assesment.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { SecurityData } from '~~/types/security/responses.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { PROJECT_SECURITY_SERVICE } from '~/components/modules/project/services/security.service';
import LfxReposExclusionFooter from '~/components/shared/components/repos-exclusion-footer.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import LfxProjectSecurityGenerateYamlSection from '~/components/modules/project/components/security/generate-yaml-section.vue';
import LfxProjectSecurityControlAssesmentHead from '~/components/modules/project/components/security/control-assesment-head.vue';
import LfxProjectRepositorySwitch from '~/components/modules/project/components/shared/header/repository-switch.vue';
import LfxProjectSecurityReposEvalModal from '~/components/modules/project/components/security/repos-eval-modal.vue';
import { SECURITY_API_SERVICE } from '~/components/modules/project/services/security.api.service';

const isSearchRepoModalOpen = ref(false);

const route = useRoute();
const { name } = route.params;

const { selectedReposValues, allArchived, archivedRepos, hasSelectedArchivedRepos } = storeToRefs(useProjectStore());

const isRepository = computed(() => !!name);
const isReposEvalModalOpen = ref(false);
const currentTab = ref('');
const accordion = ref('');

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

const openReposEvalModal = (category: string | undefined) => {
  isReposEvalModalOpen.value = true;
  currentTab.value = category || '';
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
