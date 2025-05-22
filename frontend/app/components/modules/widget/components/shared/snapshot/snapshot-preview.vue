<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="p-6 relative">
    <!-- To make preview non interactive -->
    <div class="absolute top-0 left-0 w-full h-full z-50" />

    <div class="flex justify-between items-center pb-5 border-b border-neutral-100">
      <div class="flex items-center gap-3">
        <lfx-avatar
          :src="project?.logo"
          type="organization"
          size="normal"
        />
        <p class="text-sm leading-5 font-semibold">
          {{ project?.name }}<span
            v-if="repoName"
            class="font-normal"
          >&nbsp;/ {{ repoName }}</span>
        </p>
      </div>
      <div class="text-body-2 text-neutral-500 flex items-center gap-1">
        <lfx-icon
          name="calendar"
          :size="14"
        />
        <p v-if="startDate && endDate">
          {{ DateTime.fromFormat(startDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
          → {{ DateTime.fromFormat(endDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
        </p>
        <p v-else>All time</p>
      </div>
    </div>
    <div class="pt-5">
      <h2
        v-if="config?.name"
        class="text-heading-2 font-bold font-secondary"
      >
        {{config?.name}}
      </h2>
    </div>
    <component
      :is="widgetConfig.component"
      v-if="widgetConfig.component"
      :model-value="props.data"
      :snapshot="true"
    />
    <div class="mt-5 border-t border-neutral-100 pt-8">
      <img
        src="~/assets/images/logo.svg"
        alt="LFX Insights"
      >
      <p class="pt-3 text-2xs text-neutral-400">
        The Linux Foundation ®. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {computed} from "vue";
import {DateTime} from "luxon";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets, type WidgetConfig} from "~/components/modules/widget/config/widget.config";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  widgetName: Widget,
  data: object
}>();

const widgetConfig = computed(() => lfxWidgets[props.widgetName]);

const {
project, repository, startDate, endDate
} = storeToRefs(useProjectStore());

const repoName = computed(() => (repository?.value?.name || '').split('/').at(-1));

const config = computed<WidgetConfig>(() => lfxWidgets[props.widgetName]);
</script>

<script lang="ts">
export default {
  name: 'LfxSnapshotPreview'
}
</script>
