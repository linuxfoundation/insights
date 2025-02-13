<template>
  <section class="bg-white">
    <div class="container py-8">
      <lfx-tag type="transparent">
        <lfx-icon name="rectangle-history" :size="14" />
        Collections
      </lfx-tag>
      <div class="w-full max-w-120">
        <h1 class="text-heading-1 mt-5 font-secondary font-bold leading-10">
          Discover the world's most critical open source projects
        </h1>
      </div>
    </div>
  </section>
  <section class="sticky top-14 lg:top-17 bg-white">
    <div class="container py-5">
      <div class="flex justify-between items-center">
        <div>Filters</div>
        <lfx-dropdown
          v-model="sort"
          :options="sortOptions"
          icon="fa-arrow-down-wide-short fa-light"
          type="transparent"
          dropdown-position="right" />
      </div>
    </div>
  </section>
  <section>
    <div class="container">
      <div class="flex flex-col gap-8 pt-10 pb-64">
        <lfx-collection-list-item v-for="i of 12" :key="i" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxCollectionListItem from '~/components/modules/collection/components/collection-list-item.vue';

const sortOptions = [
  {
    label: 'Most contributors',
    value: 'contributors_DESC'
  },
  {
    label: 'Alphabeticly',
    value: 'name_DESC'
  }
];

const sort = ref('contributors_DESC');
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView'
};
</script>
