<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectOverviewView from "~/components/modules/project/views/overview.vue";

const route = useRoute();
const name = route.params.name as string;
const {project, repository} = useProjectStore();
const config = useRuntimeConfig()
const repoName = (repository?.name || name).split('/').at(-1);

const title = `LFX Insights | ${project?.name} ${repoName} insights`;
const imageAlt = `${project?.name} ${repoName} insights`;
const description = `Explore ${project?.name} ${repoName} insights`;
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
