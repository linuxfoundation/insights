<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxProjectOverviewView from '~/components/modules/project/views/overview.vue';

const route = useRoute();
const { project } = storeToRefs(useProjectStore());
const config = useRuntimeConfig();

const title = computed(() => (project.value ? `${project.value.name} Insights` : 'LFX Insights'));
const description = computed(() =>
  project.value
    ? project.value.description || `Explore ${project.value.name} insights`
    : 'Explore LFX Project insights',
);
const imageAlt = computed(() => (project.value ? `${project.value.name} insights` : 'LFX Project insights'));
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);

const projectName = computed(() => project.value?.name || '');
const projectDescription = computed(() => project.value?.description || '');
const projectLogo = computed(() => project.value?.logo || '');

// Check for badge query parameter
const badgeKey = computed(() => route.query.badge as string | undefined);
const projectSlug = computed(() => route.params.slug as string | undefined);

// Single OG image component - it fetches badge data internally
defineOgImageComponent('badge', {
  projectName: project.value?.name || '',
  projectLogo: project.value?.logo || '',
  projectDescription: project.value?.description || '',
  projectSlug: projectSlug.value || '',
  badge: badgeKey.value || '',
});

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  ogImageAlt: imageAlt,
  twitterTitle: title,
  twitterDescription: description,
  twitterImageAlt: imageAlt,
});
</script>
