<template>
  <lfx-project-development-view />
</template>

<script setup lang="ts">
import LfxProjectDevelopmentView from "~/components/modules/project/views/development.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} development insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}development insights.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
