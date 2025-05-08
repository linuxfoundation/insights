<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
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
import {
computed, onServerPrefetch, watch
} from "vue";
import {useQuery} from "@tanstack/vue-query";
import type {Project} from "~~/types/project";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {PROJECT_API_SERVICE} from "~/components/modules/project/services/project.api.service";

const route = useRoute();
const {slug} = route.params;
const {project} = storeToRefs(useProjectStore());

const queryKey = computed(() => [TanstackKey.PROJECT, slug]);

const {
  data,
  suspense,
  isError,
  error
} = useQuery<Project>({
  queryKey,
  queryFn: PROJECT_API_SERVICE.fetchProject(slug as string),
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
  if(data.value) {
    project.value = data.value;
  }
})

watch(() => data.value, (value) => {
  if (value) {
    project.value = value;
  }
}, { immediate: true });
</script>
