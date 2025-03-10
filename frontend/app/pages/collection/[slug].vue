<template>
  <lfx-collection-details-view
    v-if="data"
    :collection="data"
  />
</template>

<script setup lang="ts">
import {
useFetch, useRoute, createError, showError
} from "nuxt/app";
import type {Collection} from "~~/types/collection";
import LfxCollectionDetailsView from "~/components/modules/collection/views/collection-details.vue";

const route = useRoute();
const {slug} = route.params;

const {data} = await useFetch<Collection>(
    () => `/api/collection/${slug}`,
);

if (!data.value) {
  if (import.meta.server) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collection Not Found'
    })
  } else {
    showError({
      statusCode: 404,
      statusMessage: 'Collection Not Found'
    })
  }
}
</script>
