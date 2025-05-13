<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <!-- Disclaimer -->
    <div
      v-if="!isRepository"
      class="flex justify-center items-center gap-2 pt-8"
    >
      <lfx-icon
        name="info-circle"
        :size="14"
        class="text-neutral-500"
      />
      <p class="text-body-2 text-neutral-500">
        You’re viewing an aggregated score and controls assessment for the entire project, including data from all
        available repositories. For a detailed analysis, choose a specific repository.
      </p>
    </div>
    <div class="flex flex-col md:flex-row gap-5 lg:gap-10 pt-10">
      <div class="max-w-full md:max-w-64 lg:max-w-80 w-full">
        <lfx-project-security-osps-score
          :data="data || []"
          :is-repository="isRepository"
          :is-loading="isFetching"
        />
      </div>
      <div class="flex-grow">
        <lfx-card class="p-6">
          <h3 class="text-heading-3 font-semibold font-secondary">
            Controls assessment
          </h3>
          <p class="pt-2 text-xs text-neutral-500 pb-5">
            Process of assessing a project's practices, policies, and technical measures against a set of predefined
            standards to determine its security posture, reliability, and maturity.
            <a
              :href="links.securityScore"
              class="text-brand-500"
              target="_blank"
            >Learn more</a>
          </p>
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
              <p class="text-neutral-500 text-center text-body-1 pt-5">
                Loading controls assessment...
              </p>
            </div>
          </div>
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
                  <lfx-project-security-evaluation-repository
                    v-for="(repoChecks, repo) in groupChecksByRepository(checks || [])"
                    :key="repo"
                    :checks="repoChecks || []"
                    :repository="repo"
                  />
                </template>
              </lfx-project-security-evaluation-section>
            </lfx-accordion>
          </div>
        </lfx-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {computed, onServerPrefetch, ref} from "vue";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxProjectSecurityOspsScore from "~/components/modules/project/components/security/osps-score.vue";
import LfxProjectSecurityEvaluationSection
  from "~/components/modules/project/components/security/evaluation-section.vue";
import LfxProjectSecurityEvaluationAssesment
  from "~/components/modules/project/components/security/evaluation-assesment.vue";
import LfxProjectSecurityEvaluationRepository
  from "~/components/modules/project/components/security/evaluation-repository.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import type {SecurityData} from "~~/types/security/responses.types";
import {links} from "~/config/links";
import LfxSpinner from "~/components/uikit/spinner/spinner.vue";

const accordion = ref('');

const route = useRoute();
const {name} = route.params;

const {selectedRepository} = useProjectStore()

const isRepository = computed(() => !!name)

const queryKey = computed(() => [
  TanstackKey.SECURITY_ASSESSMENT,
  route.params.slug,
  selectedRepository,
]);

const fetchData: QueryFunction<SecurityData[]> = async () => $fetch(
    `/api/project/${route.params.slug}/security/assessment`,
    {
      query: {
        repo: selectedRepository || undefined,
      }
    }
);

const {
  data, suspense, error, isFetching
} = useQuery<SecurityData[]>({
  queryKey,
  queryFn: fetchData,
});

const groupedData = computed(() => (data.value || []).reduce((mapping, check) => {
    const obj = {...mapping};
    if (!obj[check.category]) {
      obj[check.category] = [];
    }
    obj[check.category]?.push(check);
    return obj;
  }, {} as Record<string, SecurityData[]>))

const groupChecksByRepository = (checks: SecurityData[]) => (checks || []).reduce((mapping, check) => {
    const obj = {...mapping};
    if (!obj[check.repo]) {
      obj[check.repo] = [];
    }
    obj[check.repo]?.push(check);
    return obj;
  }, {} as Record<string, SecurityData[]>)

onServerPrefetch(async () => {
  await suspense()
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityView',
}
</script>
