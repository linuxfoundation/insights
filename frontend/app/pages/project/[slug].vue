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
  useRoute
} from "nuxt/app";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";
import type {Project} from "~/components/modules/project/types/project";

const route = useRoute();

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
</script>
