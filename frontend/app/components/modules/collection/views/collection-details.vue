<template>
  <div class=" min-h-[12.875rem] sticky top-14 lg:top-17 z-10">
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header :collection="props.collection" />
      <lfx-collection-filters v-model:sort="sort" v-model:tab="tab" />
    </div>
  </div>
  <div class="container py-10">
    <div class="grid grid-cols-3 gap-8">
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
      <lfx-project-list-item v-for="project of data.data" :key="project.slug" :project="project" />
    </div>
    <div v-if="status === 'pending'" class="grid grid-cols-3 gap-8 pt-8">
      <lfx-project-list-item-loading v-for="i of 6" :key="i" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Collection} from "~/components/modules/collection/types/Collection";
import LfxCollectionHeader from "~/components/modules/collection/components/details/header.vue";
import LfxCollectionFilters from "~/components/modules/collection/components/details/filters.vue";
import LfxProjectListItem from "~/components/modules/project/components/list/project-list-item.vue";
import type {Project} from "~/components/modules/project/types/project";
import type {Pagination} from "~/components/shared/types/pagination";
import LfxProjectListItemLoading from "~/components/modules/project/components/list/project-list-item-loading.vue";

const props = defineProps<{
  collection: Collection
}>()

const sort = ref('name_ASC');
const tab = ref('all');

const page = ref(1);
const pageSize = ref(50);

const projects = ref([]);

watch([sort, tab], () => {
  page.value = 1;
});

const { data, status } = useFetch<Pagination<Project>>(
    () => `/api/projects`,
    {
      params: {
        sort,
        page,
        pageSize,
        isLfx: tab.value === 'lfx',
      },
      watch: [sort, tab, page],
      transform: (res: Pagination<Project>) => {
        if (res.page === 1) {
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

onMounted(() => {
  projects.value = data.value.data;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView'
};
</script>
