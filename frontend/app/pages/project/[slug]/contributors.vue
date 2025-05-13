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
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {Widget} from "~/components/modules/widget/types/widget";

const {project} = storeToRefs(useProjectStore());
const route = useRoute()
const config = useRuntimeConfig()

const widget = route.query?.widget

const title = computed(() => {
    const widgetName = widget && lfxWidgets[widget as Widget]?.name?.length
        ? lfxWidgets[widget as Widget]?.name
        : 'contributor insights';
    return `LFX Insights | ${project.value?.name} ${widgetName}`;
});
const imageAlt = computed(() => {
    const widgetName = widget && lfxWidgets[widget as Widget]?.name?.length
        ? lfxWidgets[widget as Widget]?.name
        : '';
    return `${project.value?.name} contributor insights${widgetName ? ` - ${widgetName}` : ''}`;
});
const description = computed(() => `Explore ${project.value?.name} contributor insights`);
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
