<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-widget-area :name="WidgetArea.DEVELOPMENT" />
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
const config = useRuntimeConfig();
const name = route.params.name as string;
const { project, selectedRepositories } = storeToRefs(useProjectStore());
const widget = route.query?.widget;

const repository = computed(() => selectedRepositories.value.find((repo) => repo.slug === name));
const repoName = computed(() => (repository.value?.name || name).split('/').at(-1));

const title = computed(
  () =>
    `${project?.value?.name} ${repoName.value} Repository ${
      widget && lfxWidgets[widget as Widget]?.name?.length ? lfxWidgets[widget as Widget]?.name : 'development'
    } | LFX Insights`,
);

const description = computed(
  () =>
    `Track ${project.value?.name} ${repoName.value} development activity, ` +
    `including commits, releases, pull requests, and issues over time.`,
);

const imageAlt = computed(() => `${project.value?.name} ${repoName.value} Repository Development - LFX Insights`);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);

const projectName = computed(() => project.value?.name || '');
const projectDescription = computed(
  () => project.value?.description || `See contributor activity, code changes, and development trends over time.`,
);
const repositoryName = computed(() => repoName.value || '');
const projectLogo = computed(() => project.value?.logo || '');

defineOgImageComponent('project', {
  projectName,
  projectDescription,
  repositoryName,
  projectLogo,
});

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  ogImageAlt: imageAlt,
  twitterTitle: title,
  twitterDescription: description,
  twitterImageAlt: imageAlt,
});
</script>
