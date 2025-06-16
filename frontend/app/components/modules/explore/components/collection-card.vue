<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{name: LfxRoutes.COLLECTION, params: {slug: props.collection.slug}}">
    <div class="border border-neutral-200 rounded-lg p-5 flex flex-col gap-5">
      <lfx-icon
        name="rectangle-history"
        class="text-neutral-400"
      />
      <div>
        <h3 class="text-base leading-6 font-semibold text-neutral-900 mb-4">
          {{ props.collection.name }}
        </h3>
        <p class="text-xs leading-5 text-neutral-500 line-clamp-3">
          {{ props.collection.description }}
        </p>
      </div>
      <div
        v-if="props.collection.featuredProjects && props.collection.featuredProjects.length > 0"
      >
        <p class="text-neutral-400 text-body-2 font-medium pb-2">
          Featured projects
        </p>
        <div
          class="flex flex-wrap gap-3"
        >
          <lfx-chip
            v-for="project of props.collection.featuredProjects"
            :key="project.slug"
            type="bordered"
            class="transition hover:bg-neutral-100"
            @click.prevent="router.push({name: LfxRoutes.PROJECT, params: {slug: project.slug}})"
          >
            <lfx-avatar
              :src="project.logo"
              size="xsmall"
              type="organization"
            />
            {{ project.name }}
          </lfx-chip>
        </div>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import {useRouter} from "nuxt/app";
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import {LfxRoutes} from "~/components/shared/types/routes";
import type {Collection} from "~~/types/collection";

const router = useRouter();

const props = defineProps<{
  collection: Collection;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxExploreCollectionCard'
};
</script>
