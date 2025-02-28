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
      <div class="flex justify-between items-center gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <lfx-collection-filter-stack v-model="stack" />
          <lfx-collection-filter-industry v-model="industry" />
        </div>
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
      <div v-if="status === 'pending'" class="flex items-center justify-between h-32 py-1">
        <lfx-spinner :size="40" class=" text-neutral-300" />
      </div>
      <div v-else class="flex flex-col gap-8 pt-10 pb-16">
        <lfx-collection-list-item
          v-for="collection of (data?.data || [])"
          :key="collection.slug"
          :collection="collection"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useFetch} from "nuxt/app";
import {watch} from "vue";
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxCollectionListItem from '~/components/modules/collection/components/collection-list-item.vue';
import type {Pagination} from "~/components/shared/types/pagination";
import type {Collection} from "~/components/modules/collection/types/Collection";
import LfxCollectionFilterStack
  from "~/components/modules/collection/components/list/filters/collection-filter-stack.vue";
import LfxCollectionFilterIndustry
  from "~/components/modules/collection/components/list/filters/collection-filter-industry.vue";
import LfxSpinner from "~/components/uikit/spinner/spinner.vue";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";

const { showToast } = useToastService();

const page = ref(1);
const pageSize = ref(50);
const sort = ref('name_DESC');

const stack = ref('');
const industry = ref('');

const { data, status, error } = useFetch<Pagination<Collection>>(
    () => `/api/collection`,
    {
      params: {
        sort,
        page,
        pageSize,
        stack,
        industry,
      },
    }
);

watch(error, (err) => {
  if (err) {
    showToast(
        `There was an error fetching collections`,
        ToastTypesEnum.negative,
        undefined,
        5000
    );
  }
});

const sortOptions = [
  {
    label: 'Alphabetically',
    value: 'name_DESC'
  },
  {
    label: 'Most projects',
    value: 'projectCount_DESC'
  },
  {
    label: 'Most valuable',
    value: 'softwareValueCount_DESC'
  },
];
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView'
};
</script>
