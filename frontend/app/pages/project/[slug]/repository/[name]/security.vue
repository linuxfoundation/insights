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

const route = useRoute();
const name = route.params.name as string;
const slug = route.params.slug as string;
const {project, selectedRepositories} = storeToRefs(useProjectStore());
const config = useRuntimeConfig()
const repository = computed(() => selectedRepositories.value.find((repo) => repo.slug === name));
const repoName = computed(() => (repository.value?.name || name).split('/').at(-1));

const title = computed(() => `LFX Insights | ${project.value?.name} ${repoName.value} security insights`);
const imageAlt = computed(() => `${project.value?.name} ${repoName.value} security insights`);
const description = computed(() => `Explore ${project.value?.name} ${repoName.value} security insights`);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);
const image = computed(() => `${config.public.appUrl}/api/seo/og-image?projectSlug=${slug}&repositorySlug=${name}`);

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
