<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-8">
    <p class="text-body-2 text-neutral-500 pb-8">
      Copy and paste your badges directly into your project's GitHub README file,
      providing instant insight into the state of your project.
    </p>

    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <lfx-skeleton-state
          :status="errorHealthScore ? 'error' : statusHealthScore"
          height="1.25rem"
          width="12rem"
        >
          <img
            :src="healthBadgeUrl"
            alt="LFX Health Score badge"
            class="h-5"
          >
        </lfx-skeleton-state>

        <lfx-button
          type="tertiary"
          size="small"
          button-style="pill"
          :disabled="statusHealthScore === 'pending'"
          @click="copyBadge(markdown(healthBadgeUrl, 'LFX Health Score'))"
        >
          <lfx-icon
            name="clone"
            :size="14"
          />
          Copy markdown
        </lfx-button>
      </div>
      <div class="flex items-center justify-between">
        <lfx-skeleton-state
          :status="project?.contributorCount ? 'success' : 'pending'"
          height="1.25rem"
          width="12rem"
        >
          <img
            :src="contributorBadgeUrl"
            alt="LFX Contributors badge"
            class="h-5"
          >
        </lfx-skeleton-state>

        <lfx-button
          type="tertiary"
          size="small"
          button-style="pill"
          :disabled="project?.contributorCount ? false : true"
          @click="copyBadge(markdown(contributorBadgeUrl, 'LFX Contributors'))"
        >
          <lfx-icon
            name="clone"
            :size="14"
          />
          Copy markdown
        </lfx-button>
      </div>

      <div class="flex flex-col gap-1.5">
        <lfx-active-contributor-badge />

        <span class="text-xs text-neutral-400 italic">*Active contributors over the past 365 days</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {
lfxTrustScore, type TrustScoreConfig, getScoreBadgeUrl, getBadgeUrl
} from "~/components/modules/project/config/trust-score";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import {PROJECT_SECURITY_SERVICE} from "~/components/modules/project/services/security.service";
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import { lfxColors } from '~/config/styles/colors';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxActiveContributorBadge from "~/components/shared/modules/share/components/active-contributor-badge.vue";

const emit = defineEmits<{(e: 'copied'): void;}>();

const {showToast} = useToastService();

const route = useRoute();
const { selectedRepository, project } = storeToRefs(useProjectStore())

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value
}));

// Fetch the badge data
const {
  data: healthScoreData, status: healthScoreStatus, error: healthScoreError
} = OVERVIEW_API_SERVICE.fetchHealthScore(params);

const {
  data: securityAssessmentDataRaw,
  status: securityAssessmentStatus,
  error: securityAssessmentError
} = OVERVIEW_API_SERVICE.fetchSecurityAssessment(params);

// TODO: Remove this when we have data for them
const securityAssessmentData = computed(() => PROJECT_SECURITY_SERVICE
.removeDocumentationAndVulnerability(securityAssessmentDataRaw.value || []));

const statusHealthScore = computed<AsyncDataRequestStatus>(() => {
  if (healthScoreStatus.value === 'success' && securityAssessmentStatus.value === 'success') {
    return 'success';
  }
  if (healthScoreStatus.value === 'error' || securityAssessmentStatus.value === 'error') {
    return 'error';
  }

  return 'pending';
});
const errorHealthScore = computed(() => healthScoreError.value || securityAssessmentError.value);

const healthScore = computed(() => (healthScoreData.value
  ? OVERVIEW_API_SERVICE.convertRawValuesToHealthScore(healthScoreData.value) : []));

const ospsScore = computed(() => PROJECT_SECURITY_SERVICE
  .calculateOSPSScore((securityAssessmentData.value || []), !!selectedRepository.value));

const trustSummary = computed<TrustScoreSummary>(() => (healthScore.value
  ? OVERVIEW_API_SERVICE.convertPointsToTrustSummary(healthScore.value, ospsScore.value) : {
    overall: 0,
    popularity: 0,
    contributors: 0,
    security: 0,
    development: 0
  }));

const scoreConfig = computed<TrustScoreConfig>(() => lfxTrustScore.find(
    (s) => trustSummary.value.overall <= s.maxScore && trustSummary.value.overall >= s.minScore
) || lfxTrustScore.at(-1)!);

const healthBadgeUrl = computed(() => getScoreBadgeUrl(scoreConfig.value));
const contributorBadgeUrl = computed(() => getBadgeUrl(
  'Contributors',
  formatNumberShort(project.value?.contributorCount || 0),
  lfxColors.brand[500].replace('#', '')
));

const markdown = (badgeUrl: string, title: string) => {
  const link = window?.location.href.split('?')[0];

  return `[![${title}](${badgeUrl})](${link})`;
};

const copyBadge = (markdown: string) => {
  navigator?.clipboard.writeText(markdown);
    showToast(
        `Health score badge copied to clipboard`,
        ToastTypesEnum.positive,
    );
    emit('copied');
}

</script>

<script lang="ts">
export default {
  name: 'LfxShareBadge',
}
</script>
