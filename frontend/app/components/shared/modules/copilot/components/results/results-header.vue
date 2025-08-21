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
      class="!w-auto min-w-[200px] !max-w-[300px]"
      :match-width="true"
    >
      <template #trigger="{ selectedOption }">
        <lfx-dropdown-selector
          type="filled"
          class="!w-auto flex justify-between"
        >
          <div class="w-[88%]">
            <lfx-chat-result-label
              :version="Number(selectedOption.label)"
              :label="getTitle(selectedOption.value)"
            />
          </div>
        </lfx-dropdown-selector>
      </template>

      <lfx-dropdown-item
        v-for="(option, index) of resultsWithData"
        :key="option.id"
        :value="option.id"
        :label="getVersion(option.id)"
      >
        <div class="w-[88%]">
          <lfx-chat-result-label
            :version="index + 1"
            :label="getTitle(option.id)"
          />
        </div>
      </lfx-dropdown-item>

    </lfx-dropdown-select>

    <!-- <div class="flex items-center gap-2 mr-13">
      <lfx-menu-button
        :to="docsLink"
        class="!text-neutral-900"
      >
        <lfx-icon
          name="book-open"
        />
        Docs
      </lfx-menu-button>
    </div> -->
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxChatResultLabel from '../shared/result-label.vue'
import { useCopilotStore } from '../../store/copilot.store';
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
// import { links } from '~/config/links';
// import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
// import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  isLoading: boolean;
}>();

const { resultData, selectedResultId } = storeToRefs(useCopilotStore());

// TODO: Check if this is the correct link
// const docsLink = links.copilotDocs;

const selectedId = computed<string>({
  get: () => selectedResultId.value || '',
  set: (value) => {
    selectedResultId.value = value || '';
  }
})

const resultsWithData = computed(() => {
  return resultData.value.filter(r => r.data.length > 0);
})

const getVersion = (id: string) => {
  const idx = resultsWithData.value.findIndex(r => String(r.id) === String(id));

  return `${idx + 1}`; 
}

const getTitle = (id: string) => {
  const result = resultData.value.find(r => String(r.id) === String(id));
  return result?.title || 'Results';
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsHeader'
}
</script>
