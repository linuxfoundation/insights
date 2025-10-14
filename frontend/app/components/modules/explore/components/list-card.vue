<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="border border-neutral-200 rounded-xl flex flex-col gap-4 bg-white h-full"
  >
    <div class="flex flex-col gap-2 px-6 pt-6">
      <h3 class="text-heading-3 font-secondary font-bold text-neutral-900">
        {{ props.value.title }}
      </h3>
      <p class="text-xs text-neutral-500">
        {{ props.value.description }}
      </p>
    </div>
    <div class="px-4 pb-6 grow flex flex-col justify-between">
      <component
        :is="props.value.component"
      />
      <div
        class="flex flex-row justify-center mt-6"
      >
        <lfx-button
          type="transparent"
          @click="isModalOpen = true"
        >
          View more
        </lfx-button>
      </div>
    </div>
  </article>
  <client-only>
    <lfx-explore-list-modal
      v-model="isModalOpen"
      :value="props.value"
      width="27rem"
    />
  </client-only>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxExploreListModal from "~/components/modules/explore/components/list-modal.vue";
import type { ExploreTab } from '~/components/modules/explore/types/explore.types';

const props = defineProps<{
  value: ExploreTab;
}>();

const isModalOpen = ref(false);
</script>

<script lang="ts">
export default {
  name: 'LfxExploreListCard'
};
</script>
