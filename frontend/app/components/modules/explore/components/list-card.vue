<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article class="p-6 border border-neutral-200 rounded-xl flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h3 class="text-heading-3 font-secondary font-bold text-neutral-900">
        {{ props.title }}
      </h3>
      <p class="text-xs text-neutral-500">
        {{ props.description }}
      </p>
    </div>
    <component
      :is="props.component"
    />
    <div
      class="flex flex-row justify-center"
    >
      <lfx-button
        type="transparent"
        @click="isModalOpen = true"
      >
        View more
      </lfx-button>
    </div>
  </article>
  <lfx-modal v-model="isModalOpen">
    <component
      :is="props.component"
      :is-full-list="true"
    />
  </lfx-modal>
</template>

<script setup lang="ts">
import { ref, type Component } from "vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxModal from "~/components/uikit/modal/modal.vue";

const props = defineProps<{
  title: string;
  description: string;
  component: Component;
}>();

const isModalOpen = ref(false);
</script>

<script lang="ts">
export default {
  name: 'LfxExploreListCard'
};
</script>
