<template>
  <section class="bg-white bg-[url('~/assets/images/collections-header.png')] bg-contain bg-no-repeat bg-right">
    <div class="container py-5 md:py-8">
      <lfx-tag
        type="transparent"
        :size="pageWidth < 768 ? 'small' : 'medium'"
      >
        <lfx-icon
          name="rectangle-history"
          :size="14"
        />
        Collections
      </lfx-tag>
      <div class="w-full max-w-120">
        <h1 class="text-heading-2 lg:text-heading-1 mt-4 md:mt-5 font-secondary font-bold">
          Discover the world's most critical open source projects
        </h1>
      </div>
    </div>
  </section>
  <lfx-maintain-height class="sticky top-14 lg:top-17 ">
    <div class="bg-white border-b border-neutral-100">
      <div
        class="container transition-all"
        :class="scrollTop > 50 ? 'py-3 md:py-4' : 'py-3 md:py-5'"
      >
        <div class="flex items-center gap-4">
          <!--        <div-->
          <!--          class="flex items-center gap-4 flex-grow"-->
          <!--          style="max-width: calc(100% - 3.625rem)"-->
          <!--        >-->
          <!--          <div class="w-1/2 sm:w-auto">-->
          <!--            <lfx-collection-filter-stack v-model="stack" />-->
          <!--          </div>-->
          <!--          <div class="w-1/2 sm:w-auto">-->
          <!--            <lfx-collection-filter-industry v-model="industry" />-->
          <!--          </div>-->
          <!--        </div>-->
          <lfx-dropdown-select
            v-model="sort"
            width="20rem"
          >
            <template #trigger="{selectedOption}">
              <lfx-dropdown-selector>
                <lfx-icon
                  name="arrow-down-wide-short"
                  :size="16"
                />
                {{selectedOption.label}}
              </lfx-dropdown-selector>
            </template>

            <lfx-dropdown-item
              value="name_asc"
              label="Alphabetically"
            />
            <lfx-dropdown-item
              value="projectCount_desc"
              label="Most projects"
            />

          </lfx-dropdown-select>
        </div>
      </div>
    </div>
  </lfx-maintain-height>
  <section>
    <div class="container py-5 lg:py-10 flex flex-col  gap-5 lg:gap-8">
      <div
        v-if="data && !(status === 'pending' && data?.page === 1)"
        class="flex flex-col gap-5 lg:gap-8"
      >
        <lfx-collection-list-item
          v-for="collection of data?.data"
          :key="collection.slug"
          :collection="collection"
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
          No collections found
        </h3>
        <p class="text-body-1 text-neutral-500 pt-3 text-center">
          Try adjusting your filters to find what you’re looking for.
        </p>
      </div>
      <div
        v-if="status === 'pending'"
        class="flex flex-col gap-5 lg:gap-8"
      >
        <lfx-collection-list-item-loading
          v-for="i of 3"
          :key="i"
        />
      </div>
    </div>
  </section>
  <div
    v-if="collections.length < (data?.total || 0)"
    class="py-5 lg:py-10 flex justify-center"
  >
    <lfx-button
      size="large"
      class="!rounded-full"
      @click="loadMore"
    >
      Load more
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import {useFetch} from "nuxt/app";
import {watch} from "vue";
import type {Pagination} from "~~/types/shared/pagination";
import type {Collection} from "~~/types/collection";
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxCollectionListItem from '~/components/modules/collection/components/list/collection-list-item.vue';
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";
import useResponsive from "~/components/shared/utils/responsive";
import useScroll from "~/components/shared/utils/scroll";
import LfxCollectionListItemLoading
  from "~/components/modules/collection/components/list/collection-list-item-loading.vue";
import LfxMaintainHeight from "~/components/uikit/maintain-height/maintain-height.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";

const { showToast } = useToastService();
const {pageWidth} = useResponsive();
const {scrollTop} = useScroll();

const page = ref(0);
const pageSize = 50;
const sort = ref('projectCount_desc');

// const stack = ref('');
// const industry = ref('');

const collections = ref([]);

watch([sort], () => {
  page.value = 0;
});

const { data, status, error } = await useFetch<Pagination<Collection>>(
    () => `/api/collection`,
    {
      params: {
        sort,
        page,
        pageSize,
      },
      watch: [sort, page],
      transform: (res: Pagination<Collection>) => {
        if (res.page >0) {
          collections.value = [...collections.value, ...res.data];
        } else {
          collections.value = res.data;
        }
        return {
          ...res,
          data: collections.value,
        };
      },
    }
);

const loadMore = () => {
  page.value += 1;
};

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

onMounted(() => {
  collections.value = data.value?.data || [];
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView'
};
</script>
