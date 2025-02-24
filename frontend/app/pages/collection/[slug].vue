<template>
  <lfx-collection-details-view :collection="data" />
</template>

<script setup lang="ts">
import {useFetch, useRoute} from "nuxt/app";
import LfxCollectionDetailsView from "~/components/modules/collection/views/collection-details.vue";
import type {Collection} from "~/components/modules/collection/types/Collection";

const route = useRoute();
const {slug} = route.params;

const { data } = useFetch<Collection>(
    () => `/api/collections/${slug}`,
);
</script>
