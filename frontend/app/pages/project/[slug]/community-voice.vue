<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-community-voice-view />
</template>

<script setup lang="ts">
// import { useRoute } from 'nuxt/app';
// import { storeToRefs } from 'pinia';
// import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxCommunityVoiceView from '~/components/modules/project/views/community-voice.vue';

// TODO: Add SEO meta tags
// const { project } = storeToRefs(useProjectStore());
// const route = useRoute();
// const config = useRuntimeConfig();

// const title = computed(() => `${project.value?.name} Security Insights`);
// const imageAlt = computed(() => `${project.value?.name} security insights`);
// const description = computed(
//   () =>
//     `Check ${project.value?.name} security and best practices, ` +
//     `including vulnerabilities, dependencies, licensing, and governance compliance.`,
// );
// const url = computed(() => `${config.public.appUrl}${route.fullPath}`);
// const image = computed(() =>
//   project.value
//     ? `${config.public.appUrl}/api/seo/og-image?projectSlug=${project.value.slug}`
//     : `${config.public.appUrl}/default-og-image.jpg`,
// );

// useSeoMeta({
//   title,
//   description,
//   ogType: 'article',
//   ogUrl: url,
//   ogTitle: title,
//   ogDescription: description,
//   ogImage: image,
//   ogImageAlt: imageAlt,
//   ogImageSecureUrl: '/og-image.png',
//   ogImageType: 'image/jpeg',
//   twitterCard: 'summary_large_image',
//   twitterUrl: url,
//   twitterTitle: title,
//   twitterDescription: description,
//   twitterImage: image,
//   twitterImageAlt: imageAlt,
// });
</script>
