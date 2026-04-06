<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="projects.length > 0 || repositories.length > 0"
    class="border-y border-neutral-200 flex-1 min-h-0 overflow-y-auto"
  >
    <div class="flex flex-col">
      <div
        v-for="project in projects"
        :key="project.slug"
        class="flex items-center gap-3 py-2.5 border-b border-neutral-200 last:border-b-0"
      >
        <!-- Project avatar -->
        <div
          class="size-6 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center shrink-0"
        >
          <img
            v-if="project.logo"
            :src="project.logo"
            :alt="project.name"
            class="size-full object-contain"
          />
          <lfx-icon
            v-else
            name="folder"
            :size="14"
            class="text-neutral-400"
          />
        </div>

        <!-- Project name -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-5 text-neutral-900 truncate">
            {{ project.name }}
          </p>
        </div>

        <!-- Remove button -->
        <lfx-icon-button
          icon="circle-xmark"
          icon-type="light"
          size="small"
          type="transparent"
          class="shrink-0"
          @click="$emit('removeProject', project.slug)"
        >
          <lfx-icon
            name="circle-xmark"
            type="light"
            class="text-neutral-500"
          />
        </lfx-icon-button>
      </div>
      <div
        v-for="repository in repositories"
        :key="repository.slug"
        class="flex items-center gap-3 py-2.5 border-b border-neutral-200 last:border-b-0"
      >
        <!-- Project avatar -->
        <div
          class="size-6 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center shrink-0"
        >
          <lfx-icon
            name="book"
            :size="16"
            class="text-neutral-400"
          />
        </div>

        <!-- Project name -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-5 text-neutral-900 truncate">
            {{ repository.name }}
          </p>
        </div>

        <!-- Remove button -->
        <lfx-icon-button
          icon="circle-xmark"
          icon-type="light"
          size="small"
          type="transparent"
          class="shrink-0"
          @click="$emit('removeRepository', repository.slug)"
        >
          <lfx-icon
            name="circle-xmark"
            type="light"
            class="text-neutral-500"
          />
        </lfx-icon-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import type {
  CollectionProject,
  CollectionRepository,
} from '~/components/modules/collection/config/create-collection.config';

defineProps<{
  projects: CollectionProject[];
  repositories: CollectionRepository[];
}>();

defineEmits<{
  removeProject: [slug: string];
  removeRepository: [slug: string];
}>();
</script>

<script lang="ts">
export default {
  name: 'LfSelectedProjectsList',
};
</script>
