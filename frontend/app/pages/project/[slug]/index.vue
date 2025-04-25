<template>
  <lfx-project-overview-view />
</template>

<script setup lang="ts">
import LfxProjectOverviewView from '~/components/modules/project/views/overview.vue';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const {project} = useProjectStore();

const title = `${project?.name || 'Project'} contributors insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}contributors insights,
highlighting their efforts and impact on the project.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
