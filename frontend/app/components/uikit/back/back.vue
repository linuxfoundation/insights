<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link
    v-if="previousRoute"
    :to="previousRoute"
    v-bind="$attrs"
  >
    <slot />
  </nuxt-link>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "nuxt/app";

const router = useRouter();
const previousRoute = ref<string | null>(null);

onMounted(() => {
  previousRoute.value = router.options.history.state.back as string || null;
});
</script>

<script lang="ts">
export default {
  name: 'LfxBack'
};
</script>
