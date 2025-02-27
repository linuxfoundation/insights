<template>
  <lfx-project-header />
  <div>
    <nuxt-page />
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import LfxProjectHeader from "~/components/modules/project/components/shared/header.vue";

const route = useRoute();
const {slug} = route.params;
</script>
