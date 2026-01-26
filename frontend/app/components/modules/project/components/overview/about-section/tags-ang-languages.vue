<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="tags && tags.length > 0"
    class="flex flex-col gap-3 text-xs"
  >
    <div class="text-neutral-400 font-semibold flex items-center gap-1">Tags</div>
    <div>
      <lfx-tag
        v-for="tag of tags"
        :key="tag"
        :size="'small'"
        type="outline"
        class="justify-center mr-1.5 mb-1.5"
      >
        {{ tag }}
      </lfx-tag>
    </div>
  </div>
  <!-- <div class="flex flex-col gap-3 text-xs">
    <div class="text-neutral-400 font-semibold flex items-center gap-1">
      Programming languages
    </div>
    <div>
      <lfx-tag
        v-for="language of languages"
        :key="language.name"
        :size="'small'"
        type="outline"
        class="justify-center mr-1.5 mb-1.5"
      >

        {{ language.name }}
        <span class="text-neutral-500">
          {{ language.percentage }}%
        </span>
      </lfx-tag>
    </div>

  </div> -->
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { project } = storeToRefs(useProjectStore());

// TODO: remove this once we have the tags from the API
const tags = computed(() => project.value?.tags || []);
// const languages = project.value?.languages || [{
//   name: 'JavaScript',
//   percentage: 24
// }, {
//   name: 'TypeScript',
//   percentage: 24
// }, {
//   name: 'Python',
//   percentage: 10
// }, {
//   name: 'Go',
//   percentage: 10
// }, {
//   name: 'Ruby',
//   percentage: 10
// }];
</script>

<script lang="ts">
export default {
  name: 'LfxTagsAndLanguages',
};
</script>
