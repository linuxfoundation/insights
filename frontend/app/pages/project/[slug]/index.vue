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
const imageAlt = computed(() =>
  project.value ? `${project.value.name} insights` : 'LFX Project insights',
);
const description = computed(() =>
  project.value
    ? project.value.description || `Explore ${project.value.name} insights`
    : 'Explore LFX Project insights',
);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);
const image = computed(() =>
  project.value
    ? `${config.public.appUrl}/api/seo/og-image?projectSlug=${project.value.slug}`
    : `${config.public.appUrl}/default-og-image.jpg`,
);

useSeoMeta({
  title,
  description,
  ogType: 'article',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  ogImageAlt: imageAlt,
  ogImageSecureUrl: image,
  ogImageType: 'image/jpeg',
  twitterCard: 'summary_large_image',
  twitterUrl: url,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  twitterImageAlt: imageAlt,
});
</script>
