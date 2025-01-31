<template>
  <div class="py-8 bg-white border-b border-neutral-200">
    <div class="container">
      <h1 class="text-heading-1 font-semibold pb-4">{{ slug }}</h1>
    </div>
  </div>
  <div class="container pt-8">
    <section class="pb-8">
      <div class="flex gap-4">
        <nuxt-link
          v-for="i of 3"
          :key="i"
          :to="{name: LfxRoutes.PROJECT, params: {slug: 'lfx-insights'}}"
          class="flex-grow max-w-1/3">
          <lfx-card class="p-4 ">
            <h4 class="text-heading-4">lfx-insights</h4>
            <p class="text-sm text-neutral-500">4,500 contributors</p>
          </lfx-card>
        </nuxt-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import LfxCard from '~/components/uikit/card/card.vue';
import {LfxRoutes} from "~/components/shared/types/routes";

const route = useRoute();
const {slug} = route.params;
</script>
