<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectSecurityView from "~/components/modules/project/views/security.vue";

const route = useRoute();
const name = route.params.name as string;
const {project, repository} = useProjectStore();
const config = useRuntimeConfig()
const repoName = (repository?.name || name).split('/').at(-1);

const title = `LFX Insights | ${project?.name} ${repoName} security insights`;
const imageAlt = `${project?.name} ${repoName} security insights`;
const description = `Explore ${project?.name} ${repoName} security insights`;
const url = `${config.public.appUrl}${route.fullPath}`;
const image = `${config.public.appUrl}/api/seo/og-image?projectSlug=${project?.slug}&repositorySlug=${name}`;

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
