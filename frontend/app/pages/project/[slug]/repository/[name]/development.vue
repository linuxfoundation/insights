<template>
  <lfx-widget-area :name="WidgetArea.DEVELOPMENT" />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {Widget} from "~/components/modules/widget/types/widget";

const route = useRoute();
const name = route.params.name as string;
const {project, repository} = useProjectStore();
const widget = route.query?.widget
const config = useRuntimeConfig()
const repoName = (repository?.name || name).split('/').at(-1);

const title = `LFX Insights | ${project?.name} ${repoName} ${
  (widget && lfxWidgets[widget as Widget]?.name?.length)
    ? lfxWidgets[widget as Widget]?.name
    : 'development insights'}`;
const imageAlt = `${project?.name} ${repoName} development insights${
  (widget && lfxWidgets[widget as Widget]?.name?.length)
    ? ` - ${lfxWidgets[widget as Widget]?.name}`
    : ''}`;
const description = `Explore ${project?.name} ${repoName} development insights`;
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
