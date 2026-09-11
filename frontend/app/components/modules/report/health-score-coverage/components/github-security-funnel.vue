<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 08 "Security coverage on GitHub-hosted repositories" component for the Health
  Score Coverage report (IN-1293, epic IN-1276). Not yet wired into health-score-coverage-report.vue
  - see health-score-coverage-github-security.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Security coverage on GitHub-hosted repositories
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Two of the four security signals, OpenSSF Scorecard and security practices, exist only for repositories hosted
        on GitHub. Every repository below is GitHub-hosted, so this is the furthest security scoring can currently
        reach, and how much of that reach we have covered.
      </p>

      <div v-if="isLoading">
        <lfx-skeleton
          height="220px"
          width="100%"
        />
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[220px]"
      >
        <p class="text-neutral-500">No security coverage data available.</p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <lfx-table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Linux Foundation</th>
              <th>Share</th>
              <th>Other projects</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="stage in stages"
              :key="stage.stage"
            >
              <td>{{ stage.label }}</td>
              <td>{{ formatNumber(stage.lf) }}</td>
              <td>{{ stage.lfSharePct }}%</td>
              <td>{{ formatNumber(stage.other) }}</td>
              <td>{{ stage.otherSharePct }}%</td>
            </tr>
          </tbody>
        </lfx-table>
      </div>

      <p
        v-if="!isLoading && !isEmpty"
        class="text-xs text-neutral-400"
      >
        A further {{ formatNumber(lfNonGithub) }} repositories sit on Gerrit, GitLab and elsewhere. There, these two
        signals are absent by design rather than simply unscanned.
      </p>

      <p class="text-xs text-neutral-400">GitHub-hosted repositories · by stage</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { fetchHealthScoreCoverageGithubSecurityQuery } from '../services/github-security.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTable from '~/components/uikit/table/table.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { HealthScoreCoverageGithubSecurityStageCount } from '~~/types/report/health-score-coverage-github-security.types';

const { data, isLoading, suspense } = fetchHealthScoreCoverageGithubSecurityQuery();

onServerPrefetch(async () => {
  await suspense();
});

const stages = computed<HealthScoreCoverageGithubSecurityStageCount[]>(() => data.value?.stages ?? []);

const lfNonGithub = computed(() => data.value?.lfNonGithub ?? 0);

const isEmpty = computed(() => !isLoading.value && stages.value.length === 0);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageGithubSecurityFunnel',
};
</script>
