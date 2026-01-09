<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxProjectOverviewView from '~/components/modules/project/views/overview.vue';

const route = useRoute();
const config = useRuntimeConfig();
const { project, selectedRepositoryGroup } = storeToRefs(useProjectStore());

const title = computed(() => `${selectedRepositoryGroup.value?.name} Repositories | LFX Insights`);
const description = computed(
  () =>
    `Track repositories under ${project.value?.name} ${selectedRepositoryGroup.value?.name} with LFX Insights. ` +
    `Compare activity, contributors, and development health across related projects.`,
);

const imageAlt = computed(() => `${selectedRepositoryGroup.value?.name} Repositories - LFX Insights`);
const url = computed(() => `${config.public.appUrl}${route.fullPath}`);

const projectName = computed(() => project.value?.name || '');
const projectDescription = computed(
  () => project.value?.description || 'See contributor activity, code changes, and development trends over time.',
);
const repositoryName = computed(() => selectedRepositoryGroup.value?.name || '');
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
