<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-2 text-xs">
    <div class="text-neutral-400 font-semibold">
      About
    </div>
    <div class="text-neutral-900">
      {{ project?.description || 'No description available' }}
    </div>
  </div>
  <div
    v-if="project?.firstCommit"
    class="flex flex-col gap-2 text-xs"
  >
    <div class="text-neutral-400 font-semibold">
      First commit
    </div>
    <div class="text-neutral-900">
      {{ formatFirstCommit(project.firstCommit) }}
    </div>
  </div>
  <div
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
    <div class="text-neutral-900">
      <span v-if="project?.softwareValue">
        ${{ formatNumberShort(project?.softwareValue) }}
      </span>
      <span v-else>
        No Data
      </span>
    </div>
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
import {DateTime} from 'luxon'
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { formatNumberShort } from '~/components/shared/utils/formatter';

const { project } = storeToRefs(useProjectStore())

const formatFirstCommit = (date: string) => {
  const dt = DateTime.fromSQL(date);
  return dt.toFormat('LLLL yyyy');
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
