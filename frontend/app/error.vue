<template>
  <main>
    <lfx-navbar />
    {{error}}
    <div class="container py-30">
      <div class="flex flex-col items-center">
        <lfx-icon
          :name="notFound ? 'eyes' : 'triangle-person-digging'"
          :size="pageWidth < 768 ? 80 : 140"
          class="text-neutral-300"
        />
        <p class="text-center text-body-1 text-neutral-500 pt-10">
          <span v-if="notFound">
            Page not found
          </span>
          <span v-else>
            Internal Server Error
          </span>
        </p>
        <h1 class="text-heading-3 font-bold text-center pt-3 text-neutral-500">
          <span
            v-if="notFound"
            class="font-secondary"
          >
            Oops! The page you are looking for doesn’t exist.
          </span>
          <span
            v-else
            class="font-secondary"
          >
            Something went wrong. Please try again later.
          </span>
        </h1>
        <div class="flex justify-center pt-10">
          <nuxt-link :to="{name: LfxRoutes.COLLECTIONS}">
            <lfx-button size="large">Go back to Home</lfx-button>
          </nuxt-link>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import {clearError, useRoute} from "nuxt/app";
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxButton from "~/components/uikit/button/button.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import useResponsive from "~/components/shared/utils/responsive";

const props = defineProps<{
  error: object
}>()

const route = useRoute();
const {pageWidth} = useResponsive();

const notFound = computed(() => props.error?.statusCode === 404)

watch(route, () => {
  clearError();
})
</script>
