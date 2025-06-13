<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal v-model="isModalOpen">
    <section class="px-8 pt-6 pb-2 flex flex-col gap-5 sticky top-0 bg-white drop-shadow-sm">
      <div class="flex gap-8">
        <div class="flex flex-col gap-2">
          <h3 class="text-heading-3 font-secondary font-bold text-neutral-900">
            {{ props.value.title }}
          </h3>
          <p class="text-xs text-neutral-500">
            {{ props.value.description }}
          </p>
        </div>
        <div>
          <lfx-icon-button
            size="small"
            icon="fa fa-xmark fa-light"
            @click="isModalOpen = false"
          />
        </div>
      </div>
      <lfx-explore-table-header
        :type="props.value.type"
      />
    </section>
    <section class="px-6 py-4">
      <component
        :is="props.value.component"
        :is-full-list="true"
      />
    </section>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxExploreTableHeader from '~/components/modules/explore/components/table-header.vue';
import type { ExploreTab } from '~/components/modules/explore/types/explore.types';

const props = defineProps<{
  modelValue: boolean;
  value: ExploreTab;
}>();
const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void }>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

</script>

<script lang="ts">
export default {
  name: 'LfxExploreListCard'
};
</script>
