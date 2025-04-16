<template>
  <div class="bg-white">
    <section class="container">
      <div
        class="flex justify-between gap-4 transition"
        :class="scrollTop > 50 ? 'py-3 md:py-4' : 'py-3 md:py-5'"
      >
        <div class="flex items-center gap-4 flex-grow">
          <lfx-tabs
            class="w-full sm:w-auto"
            :width-type="pageWidth < 640 ? 'full' : 'inline'"
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
                <template v-if="option.value === 'lfx'">
                  <span class="hidden sm:inline">Linux Foundation projects</span>
                  <span class="inline sm:hidden">LF projects</span>
                </template>
                <template v-else>
                  {{option.label}}
                </template>
              </div>
            </template>
          </lfx-tabs>
        </div>
        <lfx-dropdown-select
          v-model="sort"
          width="20rem"
          placement="bottom-end"
        >
          <template #trigger="{selectedOption}">
            <lfx-dropdown-selector>
              <lfx-icon
                name="arrow-down-wide-short"
                :size="16"
              />
              <span class="hidden sm:inline">
                {{selectedOption.label}}
              </span>
            </lfx-dropdown-selector>
          </template>

          <lfx-dropdown-item
            value="name_asc"
            label="Alphabetically"
          />
          <lfx-dropdown-item
            value="contributorCount_desc"
            label="Most contributors"
          />
          <lfx-dropdown-item
            value="organizationCount_desc"
            label="Most organizations"
          />
        </lfx-dropdown-select>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxTabs from "~/components/uikit/tabs/tabs.vue";
import useResponsive from "~/components/shared/utils/responsive";

const props = defineProps<{
  sort: string;
  tab: string;
}>();

const emit = defineEmits<{(e: 'update:sort' | 'update:tab', value: string): void}>();

const {scrollTop} = useScroll();
const {pageWidth} = useResponsive();

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

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilters'
};
</script>
