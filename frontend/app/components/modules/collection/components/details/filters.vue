<template>
  <div class="bg-white">
    <section class="container">
      <div
        class="flex justify-between"
        :class="scrollTop > 50 ? 'py-4' : 'py-5'"
      >
        <div class="flex items-center gap-4">
          <lfx-tabs
            width-type="inline"
            :tabs="tabs"
            :model-value="tab"
            @update:model-value="tab = $event"
          >
            <template #slotItem="{option}">
              <div class="flex items-center gap-2">
                <template v-if="option.value === 'lfx'">
                  <img
                    v-if="tab === 'lfx'"
                    src="~/assets/images/icon.svg"
                    alt="LFX icon"
                  >
                  <img
                    v-else
                    src="~/assets/images/icon-gray.svg"
                    alt="LFX icon"
                  >
                </template>
                {{option.label}}
              </div>
            </template>
          </lfx-tabs>
        </div>
        <lfx-dropdown
          v-model="sort"
          :options="sortOptions"
          icon="fa-arrow-down-wide-short fa-light"
          type="transparent"
          dropdown-position="right"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import LfxTabs from "~/components/uikit/tabs/tabs.vue";

const props = defineProps<{
  sort: string;
  tab: string;
}>();

const emit = defineEmits<{(e: 'update:sort' | 'update:tab', value: string): void}>();

const {scrollTop} = useScroll();

const tabs = [
  { label: 'All projects', value: 'all' },
  { label: 'Linux Foundation projects', value: 'lfx' },
];

const sort = computed({
  get: () => props.sort,
  set: (value: string) => emit('update:sort', value)
});

const tab = computed({
  get: () => props.tab,
  set: (value: string) => emit('update:tab', value)
});

const sortOptions = [
  {
    label: 'Alphabeticly',
    value: 'name_ASC'
  },
  {
    label: 'Most contributors',
    value: 'contributorsCount_DESC'
  },
  {
    label: 'Most organizations',
    value: 'organizationsCount_DESC'
  },
  {
    label: 'Most valuable',
    value: 'softwareValueCount_DESC'
  },
];
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilters'
};
</script>
