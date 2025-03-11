<template>
  <lfx-project-contributors-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import LfxProjectContributorsView from "~/components/modules/project/views/contributors.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const route = useRoute();
const name = route.params.name as string;
const {project} = useProjectStore();

const title = `${name || 'Repository'} contributors insights | ${project?.name} | LFX Insights`;
const description = `Explore ${name || ''} contributors insights${project?.name ? ` under the ${project.name}` : ''}.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
