<template>
  <lfx-maintain-height class="sticky top-14 lg:top-17 z-10">
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header
        :loading="!collection"
        :collection="props.collection"
      />
      <lfx-collection-filters
        v-model:sort="sort"
        v-model:tab="tab"
      />
    </div>
  </lfx-maintain-height>
  <div class="container py-5 lg:py-10 flex flex-col gap-5 lg:gap-8">
    <div
      v-if="data && !(status === 'pending' && data?.page === 1)"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
    >
      <lfx-project-list-item
        v-for="project of data?.data"
        :key="project.slug"
        :project="project"
      />
    </div>
    <div
      v-if="data?.data.length === 0 && status == 'success'"
      class="flex flex-col items-center py-20"
    >
      <lfx-icon
        name="face-monocle"
        :size="80"
        class="text-neutral-300"
      />
      <h3 class="text-center pt-5 text-heading-3 sm:text-heading-2 font-secondary font-bold text-neutral-500">
        No projects found
      </h3>
      <p class="text-body-1 text-neutral-500 pt-3 text-center">
        Try adjusting your filters to find what you’re looking for.
      </p>
    </div>
    <div
      v-if="status === 'pending'"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
    >
      <lfx-project-list-item-loading
        v-for="i of 6"
        :key="i"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';
import type {Collection} from "~~/types/collection";
import type {Project} from "~~/types/project";
import type {Pagination} from "~~/types/shared/pagination";
import LfxCollectionHeader from "~/components/modules/collection/components/details/header.vue";
import LfxCollectionFilters from "~/components/modules/collection/components/details/filters.vue";
import LfxProjectListItem from "~/components/modules/project/components/list/project-list-item.vue";
import LfxProjectListItemLoading from "~/components/modules/project/components/list/project-list-item-loading.vue";
import useScroll from "~/components/shared/utils/scroll";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxMaintainHeight from "~/components/uikit/maintain-height/maintain-height.vue";

const props = defineProps<{
  collection: Collection
}>()

const route = useRoute();
const collectionSlug = route.params.slug as string;

const {scrollTopPercentage} = useScroll();

const sort = ref('name_asc');
const tab = ref('all');

const page = ref(0);
const pageSize = ref(50);

const projects = ref([]);

watch([sort, tab], () => {
  page.value = 0;
});

const { data, status } = await useFetch<Pagination<Project>>(
    () => `/api/project`,
    {
      params: {
        sort,
        page,
        pageSize,
        isLf: tab.value === 'lfx',
        collectionSlug
      },
      watch: [sort, tab, page],
      transform: (res: Pagination<Project>) => {
        if (res.page === 0) {
          projects.value = res.data;
        } else {
          projects.value = [...projects.value, ...res.data];
        }
        return {
          ...res,
          data: projects.value,
        };
      },
    }
);

watch(scrollTopPercentage, () => {
  if (scrollTopPercentage.value >= 100 && projects.value.length < data.value.total) {
    page.value += 1;
  }
});

onMounted(() => {
  projects.value = data.value?.data || [];
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView'
};
</script>
