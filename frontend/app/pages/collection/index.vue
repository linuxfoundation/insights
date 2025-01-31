<template>
  <div class="container pt-8">
    <h1 class="text-heading-1 font-semibold pb-4">Collections</h1>

    <section class="pb-8">
      <div class="flex gap-4">
        <nuxt-link
          v-for="i of 3"
          :key="i"
          :to="{name: LfxRoutes.COLLECTION, params: {slug: 'crowddotdev'}}"
          class="flex-grow max-w-1/3">
          <lfx-card class="p-4 ">
            <h4 class="text-heading-4">Crowd.dev</h4>
            <p class="text-sm text-neutral-500">8 repositories</p>
          </lfx-card>
        </nuxt-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import LfxCard from '~/components/uikit/card/Card.vue';
import {LfxRoutes} from "~/components/shared/types/routes";
</script>
