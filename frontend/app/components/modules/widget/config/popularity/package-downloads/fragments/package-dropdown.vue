<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-model="model"
    :class="props.fullWidth ? '!w-full' : '!w-auto'"
    :match-width="true"
    dropdown-class="z-10"
  >
    <template #trigger="{selectedOption}">
      <lfx-dropdown-selector
        type="filled"
        class="flex justify-center items-center"
      >
        <lfx-icon
          v-if="selectedOption.value === `${allPackages.ecosystem}${EcosystemSeparator}${allPackages.name}` ||
            getIcon(selectedOption.value.split(EcosystemSeparator)[0]) === ''"
          name="cube"
          :size="16"
        />
        <img
          v-else
          :src="getIcon(selectedOption.value.split(EcosystemSeparator)[0])"
          class="w-4 h-4"
        >
        {{selectedOption.label}}
      </lfx-dropdown-selector>
    </template>

    <div
      class="sticky -top-1 z-10 bg-white flex flex-col gap-1 -mt-1 pt-1"
    >
      <lfx-dropdown-item
        :value="`${allPackages.ecosystem}${EcosystemSeparator}${allPackages.name}`"
        :label="allPackages.name"
      />
      <lfx-dropdown-separator />

      <lfx-dropdown-search
        v-model="search"
      />
      <lfx-dropdown-separator />
    </div>
    <div
      v-if="noResults"
      class="py-8 text-center italic text-body-2 text-neutral-400"
    >
      No results found
    </div>
    <template
      v-for="(group, ecosystem) in groupedPackages"
      :key="ecosystem"
    >
      <template v-if="group">
        <lfx-dropdown-group-title>
          {{ getEcosystemLabel(ecosystem) }}
        </lfx-dropdown-group-title>

        <lfx-dropdown-item
          v-for="option of group"
          :key="option.repo"
          :value="`${ecosystem}${EcosystemSeparator}${option.name}`"
          :label="option.name"
        >
          <lfx-icon
            v-if="getIcon(ecosystem) === ''"
            name="cube"
            :size="16"
          />
          <img
            v-else
            :src="getIcon(ecosystem)"
            class="w-4 h-4"
          >
          {{ option.name }}
        </lfx-dropdown-item>
      </template>
    </template>
  </lfx-dropdown-select>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownGroupTitle from "~/components/uikit/dropdown/dropdown-group-title.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import LfxDropdownSearch from "~/components/uikit/dropdown/dropdown-search.vue";
import type { Package } from "~~/types/popularity/responses.types";
import { ecosystems } from '~~/app/config/ecosystems';
import { EcosystemSeparator } from '~~/types/shared/ecosystems.types';

const props = withDefaults(defineProps<{
  modelValue: string;
  packages: Package[];
  fullWidth?: boolean
}>(), {
  fullWidth: true,
});

const allPackages: Package = {
  name: 'All packages',
  repo: 'all',
  ecosystem: 'all',
};
const allEcosystem: Package = {
  name: '(all packages)',
  repo: 'all',
  ecosystem: '',
};

const emit = defineEmits<{(e: 'update:modelValue', value: string): void;}>();

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
const search = ref('');

// TODO: coordinate with Nuno regarding handling of icons not in the ecosystem list
const getIcon = (ecosystem: string) => ecosystems[ecosystem]?.image || '';

const getEcosystemLabel = (ecosystem: string) => ecosystems[ecosystem]?.label || ecosystem;

const filteredPackages = computed(() => props.packages.filter((item) => {
  const searchValue = search.value.toLowerCase();
  return searchValue ? (item.name.toLowerCase().includes(searchValue)
      || item.ecosystem.toLowerCase().includes(searchValue)) : true;
}));

const groupedPackages = computed(() => filteredPackages.value.reduce((acc, item) => {
    acc[item.ecosystem] = acc[item.ecosystem] || [];
    if (acc[item.ecosystem]!.length === 0) {
      acc[item.ecosystem]!.push({
        ...allEcosystem,
        ecosystem: item.ecosystem,
        name: `${getEcosystemLabel(item.ecosystem)} ${allEcosystem.name}`
      });
    }
    acc[item.ecosystem]!.push(item);
    return acc;
  }, {} as Record<string, Package[]>));

const noResults = computed(() => search.value && !filteredPackages.value.length);
</script>

<script lang="ts">
export default {
  name: 'LfxPackageDropdown'
}
</script>
