<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-organization-overview />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';
import LfxOrganizationOverview from '~/components/modules/organization/views/overview.vue';

const route = useRoute();
const { organization } = storeToRefs(useOrganizationPageStore());
const config = useRuntimeConfig();

const title = computed(() =>
  organization.value ? `${organization.value.displayName} - Open Source Impact` : 'LFX Insights',
);
const description = computed(() =>
  organization.value
    ? organization.value.description || `Explore ${organization.value.displayName}'s open source contributions`
    : 'Explore organization insights on LFX',
);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
