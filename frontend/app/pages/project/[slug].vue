<template>
  <lfx-project-header
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
  useRoute,
} from "nuxt/app";
import {storeToRefs} from "pinia";
import {computed, onServerPrefetch} from "vue";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type {Project} from "~~/types/project";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const route = useRoute();
const {slug} = route.params;
const {project} = storeToRefs(useProjectStore());

const queryKey = computed(() => ['project', slug]);

const fetchProject: QueryFunction<Project> = async () => $fetch(`/api/project/${slug}`)

const {
  data,
  suspense,
  isError,
  error
} = useQuery<Project>({
  queryKey,
  queryFn: fetchProject,
  retry: false,
});

onServerPrefetch(async () => {
  await suspense();
  if (isError.value) {
    const statusMessage = error.value?.message || 'Project Not Found';

    if (import.meta.server) {
      throw createError({ statusCode: 404, statusMessage });
    } else {
      showError({ statusCode: 404, statusMessage });
    }
  }
  else {
    project.value = data.value;
  }
})

</script>
