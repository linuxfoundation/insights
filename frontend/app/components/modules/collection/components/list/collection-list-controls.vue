<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-4">
    <lfx-dropdown-select
      v-model="sortValue"
      width="20rem"
      placement="bottom-end"
      @update:model-value="emit('update:sort', $event)"
    >
      <template #trigger="{ selectedOption }">
        <lfx-dropdown-selector>
          <lfx-icon
            name="arrow-down-wide-short"
            :size="16"
          />
          <span class="hidden sm:inline">{{ selectedOption.label }}</span>
        </lfx-dropdown-selector>
      </template>

      <lfx-dropdown-item
        value="starred_desc"
        label="Featured"
      />
      <lfx-dropdown-item
        value="likeCount_desc"
        label="Most liked"
      />
      <lfx-dropdown-item
        value="projectCount_desc"
        label="Most projects"
      />
      <lfx-dropdown-item
        value="name_asc"
        label="Alphabetically"
      />
    </lfx-dropdown-select>

    <div>
      <lfx-tabs
        :tabs="viewTabs"
        tab-style="pill"
        :model-value="props.view"
        @update:model-value="emit('update:view', $event)"
      >
        <template #slotItem="{ option }">
          <div class="py-1">
            <lfx-icon :name="option.icon!" />
          </div>
        </template>
      </lfx-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';

const props = defineProps<{
  sort: string;
  view: string;
}>();

const emit = defineEmits<{
  (e: 'update:sort', value: string): void;
  (e: 'update:view', value: string): void;
}>();

const sortValue = computed({
  get: () => props.sort,
  set: (value: string) => emit('update:sort', value),
});

const viewTabs = [
  { label: '', value: 'grid', icon: 'grid-2' },
  { label: '', value: 'list', icon: 'list-ul' },
];
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListControls',
};
</script>
