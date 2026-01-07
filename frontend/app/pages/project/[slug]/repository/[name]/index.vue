<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxProjectOverviewView from '~/components/modules/project/views/overview.vue';

const route = useRoute();
const name = route.params.name as string;
const { project, selectedRepositories } = storeToRefs(useProjectStore());
const config = useRuntimeConfig();

const repository = computed(() => selectedRepositories.value.find((repo) => repo.slug === name));
const repoName = computed(() => (repository.value?.name || name).split('/').at(-1));

const title = computed(() => `${project.value?.name} ${repoName.value} Repository | LFX Insights`);
const description = computed(
  () =>
    `Analyze the ${repoName.value} repository with LFX Insights. ` +
    `See contributor activity, code changes, and development trends over time.`,
);
const imageAlt = computed(() => `${project.value?.name} ${repoName.value} insights`);
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
