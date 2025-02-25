<template>
  <div class="bg-white">
    <section class="container">
      <div class="flex justify-between" :class="scrollTop > 50 ? 'py-4' : 'py-5'">
        <div class="flex items-center gap-4">
          <lfx-menu-button :active="tab === 'all'" @click="tab = 'all'">
            All projects
          </lfx-menu-button>
          <lfx-menu-button :active="tab === 'linux'" @click="tab = 'linux'">
            <img src="~/assets/images/icon.svg" alt="LFX icon">
            Linux Foundation projects
          </lfx-menu-button>
        </div>
        <lfx-dropdown
          v-model="sort"
          :options="sortOptions"
          icon="fa-arrow-down-wide-short fa-light"
          type="transparent"
          dropdown-position="right" />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";

const props = defineProps<{
  sort: string;
  tab: string;
}>();

const emit = defineEmits<{(e: 'update:sort' | 'update:tab', value: string): void}>();

const {scrollTop} = useScroll();

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
