<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectSecurityView from "~/components/modules/project/views/security.vue";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} security & best practices insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}security & best practices insights.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
