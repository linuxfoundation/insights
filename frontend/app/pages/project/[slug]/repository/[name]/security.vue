<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxProjectSecurityView from '~/components/modules/project/views/security.vue';

const route = useRoute();
const config = useRuntimeConfig();
const name = route.params.name as string;
const { project, selectedRepositories } = storeToRefs(useProjectStore());
const repository = computed(() => selectedRepositories.value.find((repo) => repo.slug === name));
const repoName = computed(() => (repository.value?.name || name).split('/').at(-1));

const title = computed(() => `${project.value?.name} ${repoName.value} Repository Security | LFX Insights`);
const description = computed(
  () =>
    `Check ${project.value?.name} ${repoName.value} security and best practices, ` +
    `including vulnerabilities, dependencies, licensing, and governance compliance.`,
);

const imageAlt = computed(() => `${project.value?.name} ${repoName.value} Repository Security - LFX Insights`);
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
