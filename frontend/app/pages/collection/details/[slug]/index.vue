<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-details-view :slug="slug as string" />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import LfxCollectionDetailsView from '~/components/modules/collection/views/collection-details.vue';

const route = useRoute();
const { slug } = route.params;
</script>
