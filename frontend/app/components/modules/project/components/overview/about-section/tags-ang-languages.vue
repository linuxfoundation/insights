<template>
  <div class="flex flex-col gap-3 text-xs">
    <div class="text-neutral-400 font-semibold flex items-center gap-1">
      Tags
    </div>
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
  <div class="flex flex-col gap-3 text-xs">
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

  </div>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';

const tags = ['k8s-staging', 'k8s-production', 'k8s-dev', 'cncf', 'containers'];
const languages = [{
  name: 'JavaScript',
  percentage: 24
}, {
  name: 'TypeScript',
  percentage: 24
}, {
  name: 'Python',
  percentage: 10
}, {
  name: 'Go',
  percentage: 10
}, {
  name: 'Ruby',
  percentage: 10
}];
</script>

<script lang="ts">
export default {
  name: 'LfxTagsAndLanguages'
};
</script>
