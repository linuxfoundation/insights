<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-area :name="WidgetArea.CONTRIBUTORS" />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxWidgetArea from '~/components/modules/widget/components/shared/widget-area.vue';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import type { Widget } from '~/components/modules/widget/types/widget';

const route = useRoute();
const { project } = storeToRefs(useProjectStore());

const widget = route.query?.widget;

const title = computed(() => {
  const name = project.value?.name;
  if (!name) return 'LFX Insights';
  const widgetName =
    widget && lfxWidgets[widget as Widget]?.name?.length ? lfxWidgets[widget as Widget]?.name : 'Contributors Insights';
  return widget ? `${name} ${widgetName} | LFX Insights` : `${name} Contributors & Organizations | LFX Insights`;
});
const description = computed(() =>
  project.value?.name
    ? `See who contributes to ${project.value.name}, ` +
      `with insights on maintainers, top contributors, and organizations in open source.`
    : 'See who contributes to this project, with insights on maintainers, top contributors, and organizations.',
);

const imageAlt = computed(() => `${project.value?.name} Contributors Insights - LFX Insights`);

const projectName = computed(() => project.value?.name || '');
const projectDescription = computed(() => project.value?.description || '');
const projectLogo = computed(() => project.value?.logo || '');

defineOgImage('Project', {
  projectName,
  projectDescription,
  repositoryName: '',
  projectLogo,
});

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogTitle: title,
  ogDescription: description,
  ogImageAlt: imageAlt,
  twitterTitle: title,
  twitterDescription: description,
  twitterImageAlt: imageAlt,
});
</script>
