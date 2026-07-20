<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-area :name="WidgetArea.CONTRIBUTORS" />
</template>

<script setup lang="ts">
import LfxWidgetArea from '~/components/modules/widget/components/shared/widget-area.vue';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionContributorsView',
};
</script>
