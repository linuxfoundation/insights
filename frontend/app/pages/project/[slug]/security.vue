<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectSecurityView from "~/components/modules/project/views/security.vue";

const {project} = storeToRefs(useProjectStore());
const route = useRoute()
const config = useRuntimeConfig()

const title = computed(() => `LFX Insights | ${project.value?.name} security insights`);
const imageAlt = computed(() => `${project.value?.name} security insights`);
const description = computed(() => `Explore ${project.value?.name} security insights`);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);
const image = computed(() => (project.value
    ? `${config.public.appUrl}/api/seo/og-image?projectSlug=${project.value.slug}`
    : `${config.public.appUrl}/default-og-image.jpg`));

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
