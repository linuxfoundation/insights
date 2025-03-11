<template>
  <lfx-project-development-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import LfxProjectDevelopmentView from "~/components/modules/project/views/development.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const route = useRoute();
const name = route.params.name as string;
const {project} = useProjectStore();

const title = `${name || 'Repository'} development insights | ${project?.name} | LFX Insights`;
const description = `Explore ${name || ''}development insights${project?.name ? ` under the ${project.name}` : ''}.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
