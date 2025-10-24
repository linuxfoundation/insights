<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-area :name="WidgetArea.POPULARITY" />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';
import LfxWidgetArea from '~/components/modules/widget/components/shared/widget-area.vue';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import type { Widget } from '~/components/modules/widget/types/widget';

const route = useRoute();
const slug = route.params.slug as string;
const { project, selectedRepositoryGroup } = storeToRefs(useProjectStore());
const widget = route.query?.widget;
const config = useRuntimeConfig();

const title = computed(() => {
  const widgetName =
    widget && lfxWidgets[widget as Widget]?.name?.length ? lfxWidgets[widget as Widget]?.name : 'Popularity';
  return widget
    ? `${selectedRepositoryGroup.value?.name} Repositories ${widgetName} | LFX Insights`
    : `${selectedRepositoryGroup.value?.name} Repositories Popularity | LFX Insights`;
});

const imageAlt = computed(
  () =>
    `${project.value?.name} ${selectedRepositoryGroup.value?.name} popularity insights${
      widget && lfxWidgets[widget as Widget]?.name?.length ? ` - ${lfxWidgets[widget as Widget]?.name}` : ''
    }`,
);

const description = computed(
  () =>
    `Explore ${project.value?.name} ${selectedRepositoryGroup.value?.name} popularity ` +
    `with data on stars, forks, watchers, and adoption across the open source ecosystem.`,
);

const url = computed(() => `${config.public.appUrl}${route.fullPath}`);

const image = computed(
  () =>
    `${config.public.appUrl}/api/seo/og-image?projectSlug=${slug}&repositoryGroupSlug=${
      selectedRepositoryGroup.value?.slug
    }`,
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
  ogImageSecureUrl: '/og-image.png',
  ogImageType: 'image/jpeg',
  twitterCard: 'summary_large_image',
  twitterUrl: url,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  twitterImageAlt: imageAlt,
});
</script>
