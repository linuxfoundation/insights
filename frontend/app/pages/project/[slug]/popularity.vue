<template>
  <lfx-project-popularity-view />
</template>

<script setup lang="ts">
import LfxProjectPopularityView from "~/components/modules/project/views/popularity.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} popularity insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}popularity insights.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
