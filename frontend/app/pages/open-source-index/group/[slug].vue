<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index :group="slug as string" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import LfxOpenSourceIndex from '~/components/modules/open-source-index/views/open-source-index.vue';

const route = useRoute();
const {slug} = route.params;
</script>
