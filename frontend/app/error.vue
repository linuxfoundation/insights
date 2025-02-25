<template>
  <main>
    <lfx-navbar />
    <div class="container py-10">
      <h1 class="text-center text-[5rem] font-secondary">{{ error.statusCode }}</h1>
      <p class="text-heading-4 text-neutral-600 text-center">
        <span v-if="error.statusCode === 404">Oops! The page you are looking for does not exist.</span>
        <span v-else>Something went wrong. Please try again later.</span>
      </p>

      <div class="flex justify-center pt-4">
        <nuxt-link :to="{name: LfxRoutes.COLLECTIONS}">
          <lfx-button type="tertiary">Return home</lfx-button>
        </nuxt-link>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxButton from "~/components/uikit/button/button.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {clearError, useRoute} from "nuxt/app";

defineProps<{
  error: object
}>()

const route = useRoute();

watch(route, () => {
  clearError();
})
</script>
