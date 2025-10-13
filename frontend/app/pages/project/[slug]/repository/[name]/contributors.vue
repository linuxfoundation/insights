<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-area :name="WidgetArea.CONTRIBUTORS" />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {Widget} from "~/components/modules/widget/types/widget";

const route = useRoute();
const name = route.params.name as string;
const slug = route.params.slug as string;
const {project, selectedRepositories} = storeToRefs(useProjectStore());
const widget = route.query?.widget
const config = useRuntimeConfig()
const repository = computed(() => selectedRepositories.value.find((repo) => repo.slug === name));
const repoName = computed(() => (repository.value?.name || name).split('/').at(-1));

const title = computed(() => `${project?.value?.name} ${repoName.value} Repository ${
    (widget && lfxWidgets[widget as Widget]?.name?.length)
        ? lfxWidgets[widget as Widget]?.name
        : 'contributor'} | LFX Insights`);

const imageAlt = computed(() => `${project?.value?.name} ${repoName.value} contributor insights${
    (widget && lfxWidgets[widget as Widget]?.name?.length)
        ? ` - ${lfxWidgets[widget as Widget]?.name}`
        : ''}`);

const description = computed(() =>
  `See who contributes to ${project?.value?.name} ${repoName.value}, `
  + `with insights on maintainers, top contributors, and organizations in open source.`);
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
