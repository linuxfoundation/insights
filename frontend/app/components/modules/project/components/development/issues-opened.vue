<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-frame
    :widget-config="widgetConfig"
    :project="project"
    @data-loaded="$emit('dataLoaded', $event)"
  >
    <lfx-widget-issues-opened
      @data-loaded="$emit('dataLoaded', $event)"
    />
  </lfx-widget-frame>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import { Widget } from '~/components/modules/widget/types/widget';
import LfxWidgetFrame from '~/components/modules/widget/components/widget-frame.vue';
import LfxWidgetIssuesOpened from '~/components/modules/widget/config/development/issues-opened/issues-opened.vue';

defineEmits<{
(e: 'dataLoaded', value: string): void;
}>();

const { project } = storeToRefs(useProjectStore());

const widgetConfig = lfxWidgets[Widget.ISSUES_OPENED];
</script>

<script lang="ts">
export default {
  name: 'LfxProjectIssuesOpened',
}
</script> 