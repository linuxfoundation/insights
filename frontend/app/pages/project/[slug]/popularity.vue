<template>
  <lfx-widget-area :name="WidgetArea.POPULARITY" />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {WidgetArea} from "~/components/modules/widget/types/widget-area";
import LfxWidgetArea from "~/components/modules/widget/components/shared/widget-area.vue";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {Widget} from "~/components/modules/widget/types/widget";

const {project} = useProjectStore();
const route = useRoute()
const config = useRuntimeConfig()

const widget = route.query?.widget

const title = `LFX Insights | ${project?.name} ${(widget && lfxWidgets[widget as Widget]?.name?.length)
    ? lfxWidgets[widget as Widget]?.name
    : 'popularity insights'}`;
const imageAlt = `${project?.name} popularity insights${(widget && lfxWidgets[widget as Widget]?.name?.length)
    ? ` - ${lfxWidgets[widget as Widget]?.name}`
    : ''}`;
const description = `Explore ${project?.name} popularity insights`;
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
