<template>
  <lfx-project-security-view />
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectSecurityView from "~/components/modules/project/views/security.vue";

const route = useRoute();
const name = route.params.name as string;
const {project} = useProjectStore();

const title = `${name || 'Repository'} security & best practices insights | ${project?.name} | LFX Insights`;
const description = `Explore ${name || ''} security & best practices
insights${project?.name ? ` under the ${project.name}` : ''}.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
