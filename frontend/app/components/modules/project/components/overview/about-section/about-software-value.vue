<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2 text-xs">
    <div class="text-neutral-400 font-semibold">About</div>
    <div class="text-neutral-900">
      {{ project?.description || 'No description available' }}
    </div>
  </div>
  <div
    v-if="project?.firstCommit"
    class="flex flex-col gap-2 text-xs"
  >
    <div class="text-neutral-400 font-semibold">First commit</div>
    <lfx-tooltip :disabled="!project.firstCommitUrl">
      <template
        v-if="project.firstCommitUrl"
        #content
      >
        <div class="flex items-center gap-1 text-white">
          <lfx-icon
            name="github"
            type="brands"
            :size="14"
          />
          <span class="text-xs font-semibold">View commit</span>
          <lfx-icon
            name="arrow-up-right-from-square"
            type="regular"
            :size="14"
            class="text-neutral-400"
          />
        </div>
      </template>
      <a
        v-if="project.firstCommitUrl"
        :href="project.firstCommitUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-neutral-900 hover:underline"
      >
        {{ formatFirstCommit(project.firstCommit) }}
      </a>
      <span
        v-else
        class="text-neutral-900"
      >
        {{ formatFirstCommit(project.firstCommit) }}
      </span>
    </lfx-tooltip>
  </div>
  <div
    v-if="project?.softwareValue"
    class="flex flex-col gap-2 text-xs"
  >
    <div class="text-neutral-400 font-semibold flex items-center gap-1">
      Software value
      <lfx-tooltip
        content="Based on Constructive Cost Model (COCOMO)"
        placement="top"
      >
        <lfx-icon name="question-circle" />
      </lfx-tooltip>
    </div>
    <div class="text-neutral-900">${{ formatNumberShort(project?.softwareValue) }}</div>
  </div>
  <!--  <div-->
  <!--    class="flex flex-col gap-3 text-xs"-->
  <!--  >-->
  <!--    <div class="text-neutral-400 font-semibold flex items-center gap-1">-->
  <!--      Maturity status-->
  <!--      <lfx-tooltip-->
  <!--        content="Maturity status"-->
  <!--        placement="top"-->
  <!--      >-->
  <!--        <lfx-icon name="question-circle" />-->
  <!--      </lfx-tooltip>-->
  <!--    </div>-->
  <!--    <div>-->
  <!--      <lfx-tag-->
  <!--        v-if="project?.maturityStatus"-->
  <!--        size="small"-->
  <!--        variation="info"-->
  <!--        type="outline"-->
  <!--        class="justify-center"-->
  <!--      >-->
  <!--        {{ project?.maturityStatus }}-->
  <!--      </lfx-tag>-->
  <!--      <span-->
  <!--        v-else-->
  <!--        class="text-neutral-900"-->
  <!--      >-->
  <!--        No Data-->
  <!--      </span>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { DateTime } from 'luxon';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { formatNumberShort } from '~/components/shared/utils/formatter';

const { project } = storeToRefs(useProjectStore());

const formatFirstCommit = (date: string) => {
  const dt = DateTime.fromSQL(date);
  return dt.toFormat('LLLL yyyy');
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection',
};
</script>
