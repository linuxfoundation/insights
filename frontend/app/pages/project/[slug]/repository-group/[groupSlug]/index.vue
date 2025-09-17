<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectOverviewView from "~/components/modules/project/views/overview.vue";

const route = useRoute();
const slug = route.params.slug as string;
const {project, selectedRepositoryGroup} = storeToRefs(useProjectStore());
const config = useRuntimeConfig()

const title = computed(() => `LFX Insights | ${project.value?.name} ${selectedRepositoryGroup.value?.name} insights`);
const imageAlt = computed(() => `${project.value?.name} ${selectedRepositoryGroup.value?.name} insights`);
const description = computed(() => `Explore ${project.value?.name} ${selectedRepositoryGroup.value?.name} insights`);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);
const image = computed(() => `${config.public.appUrl}/api/seo/og-image?projectSlug=${slug}&repositoryGroupSlug=${
  selectedRepositoryGroup.value?.slug
}`);

useSeoMeta({
  title,
  description,
  ogType: 'article',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  ogImageAlt: imageAlt,
  ogImageSecureUrl: '/og-image.png',
  ogImageType: 'image/jpeg',
  twitterCard: 'summary_large_image',
  twitterUrl: url,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  twitterImageAlt: imageAlt,
})
</script>
