<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectOverviewView from "~/components/modules/project/views/overview.vue";

const route = useRoute();
const {project} = useProjectStore();
const config = useRuntimeConfig()

const title = `LFX Insights | ${project?.name} insights`;
const imageAlt = `${project?.name} insights`;
const description = `Explore ${project?.name} insights`;
const url = `${config.public.appUrl}${route.fullPath}`;
const image = `${config.public.appUrl}/api/seo/og-image?projectSlug=${project?.slug}`;

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
