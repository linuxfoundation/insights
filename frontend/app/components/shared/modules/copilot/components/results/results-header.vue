<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-between w-full mb-8">
    <lfx-skeleton
      v-if="isLoading"
      height="2.25rem"
      width="15rem"
      class="rounded-sm"
    />
    <lfx-dropdown-select
      v-else
      v-model="selectedId"
      class="!w-auto min-w-[200px]"
      :match-width="true"
    >
      <template #trigger="{ selectedOption }">
        <lfx-dropdown-selector
          type="filled"
          class="!w-auto flex justify-between"
        >
          <lfx-chat-result-label
            :version="Number(selectedOption.label)"
            label="Result"
          />
        </lfx-dropdown-selector>
      </template>

      <lfx-dropdown-item
        v-for="(option, index) of props.results"
        :key="option.id"
        :value="option.id"
        :label="getVersion(option.id)"
      >
        <lfx-chat-result-label
          :version="index + 1"
          label="Result"
        />
      </lfx-dropdown-item>

    </lfx-dropdown-select>

    <div class="flex items-center gap-2 mr-13">
      <lfx-menu-button
        :to="docsLink"
        class="!text-neutral-900"
      >
        <lfx-icon
          name="book-open"
        />
        Docs
      </lfx-menu-button>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxChatResultLabel from '../chat-history/result-label.vue'
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { links } from '~/config/links';
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxIcon from '~/components/uikit/icon/icon.vue';

const emit = defineEmits<{
  (e: 'update:selectedResult', value: string): void;
}>();

const props = defineProps<{
  results: ResultsHistory[];
  selectedResultId: string | null;
  isLoading: boolean;
}>();

// TODO: Check if this is the correct link
const docsLink = links.copilotDocs;

const selectedId = computed<string>({
  get: () => props.selectedResultId || '',
  set: (value) => {
    emit('update:selectedResult', value || '');
  }
})

const getVersion = (id: string) => {
  const idx = props.results.findIndex(r => String(r.id) === String(id));

  return `${idx + 1}`; 
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsHeader'
}
</script>
