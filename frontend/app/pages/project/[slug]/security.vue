<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxProjectSecurityView from '~/components/modules/project/views/security.vue';

const { project } = storeToRefs(useProjectStore());

const title = computed(() =>
  project.value?.name ? `${project.value.name} Security & Best Practices | LFX Insights` : 'LFX Insights',
);
const description = computed(() =>
  project.value?.name
    ? `Check ${project.value.name} security and best practices, ` +
      `including vulnerabilities, dependencies, licensing, and governance compliance.`
    : 'Check project security and best practices, including vulnerabilities, dependencies, and governance.',
);

const imageAlt = computed(() => `${project.value?.name} Security Insights - LFX Insights`);

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
