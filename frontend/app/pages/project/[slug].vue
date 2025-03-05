<template>
  <lfx-project-header
    v-if="data"
    :project="data"
  />
  <div>
    <nuxt-page />
  </div>
</template>

<script setup lang="ts">
import {
  createError,
  showError,
  useFetch,
  useRoute,
} from "nuxt/app";
import {storeToRefs} from "pinia";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";
import type {Project} from "~/components/modules/project/types/project";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const route = useRoute();
const {project} = storeToRefs(useProjectStore());

const { data } = await useFetch<Project>(
    () => `/api/project/${route.params.slug}`,
);

if (!data.value) {
  if (import.meta.server) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project Not Found'
    })
  } else {
    showError({
      statusCode: 404,
      statusMessage: 'Project Not Found'
    })
  }
}
else {
  project.value = data.value;
}
</script>
