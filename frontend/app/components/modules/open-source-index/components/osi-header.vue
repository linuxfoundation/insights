<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white outline outline-1 outline-neutral-200">
    <section class="container py-4 sm:py-6">
      <div class="flex flex-col lg:flex-row items-start lg:items-end gap-4 lg:gap-12">
        <div class="flex flex-row gap-5 flex-grow items-end">
          <div>
            <h1 class="text-xl md:text-heading-1 font-bold pb-2 font-secondary">
              Open Source Index
            </h1>
            <p class="text-body-2 sm:text-body-1 text-neutral-500">
              Curated list of the most critical open source projects powering our modern digital
              infrastructure, measured by contributor volume and software value
            </p>
          </div>
        </div>
        <div class="lg:flex hidden items-end gap-4 justify-end">
          <div class="border-r border-neutral-200 pr-4">
            <lfx-tabs
              :tabs="viewTabs"
              :model-value="view"
              @update:model-value="view = $event"
            >
              <template #slotItem="{ option }">
                <div class="flex items-center gap-2 -mx-1">
                  <lfx-icon
                    :name="option.icon"
                    :size="14"
                  />
                  {{ option.label }}
                </div>
              </template>
            </lfx-tabs>
          </div>

          <lfx-button
            type="tertiary"
            button-style="pill"
            @click="share()"
          >
            <lfx-icon name="share-nodes" />
            Share
          </lfx-button>
        </div>
      </div>
    </section>
    <section
      class="container border-t border-t-neutral-100 py-2 sm:py-4 flex justify-between items-center"
    >
      <slot>
        <div class="hidden items-center gap-4 md:flex">
          <lfx-menu-button
            v-if="view == 'list'"
            :active="type === 'projects'"
            @click="type = 'projects'"
          >
            All projects
          </lfx-menu-button>
          <lfx-menu-button
            v-if="view == 'list'"
            :active="type === 'collections'"
            @click="type = 'collections'"
          >
            <lfx-icon name="rectangle-history" />
            Collections
          </lfx-menu-button>
          <lfx-menu-button
            :active="type === 'horizontal'"
            @click="type = 'horizontal'"
          >
            <lfx-icon name="layer-group" />
            Stacks
          </lfx-menu-button>
          <lfx-menu-button
            :active="type === 'vertical'"
            @click="type = 'vertical'"
          >
            <lfx-icon name="buildings" />
            Industries
          </lfx-menu-button>
        </div>
        <div class="flex md:hidden">
          <lfx-dropdown-select
            v-model="type"
            width="12.5rem"
            placement="bottom-start"
          >
            <template #trigger="{ selectedOption }">
              <lfx-dropdown-selector class="justify-between">
                {{ selectedOption.label }}
              </lfx-dropdown-selector>
            </template>
            <lfx-dropdown-item
              value="projects"
              label="All projects"
            />
            <lfx-dropdown-item
              value="collections"
              label="Collections"
            />
            <lfx-dropdown-item
              value="horizontal"
              label="Stacks"
            />
            <lfx-dropdown-item
              value="vertical"
              label="Industries"
            />
          </lfx-dropdown-select>
        </div>
      </slot>

      <lfx-dropdown-select
        v-model="sort"
        width="12.5rem"
        placement="bottom-end"
      >
        <template #trigger="{ selectedOption }">
          <lfx-dropdown-selector class="justify-between">
            <div class="flex items-center gap-2">
              <lfx-icon
                name="arrow-down-wide-short"
                :size="16"
              />
              {{ selectedOption.label }}
            </div>
          </lfx-dropdown-selector>
        </template>

        <lfx-dropdown-item
          value="totalContributors"
          label="Most contributors"
        />
        <lfx-dropdown-item
          value="softwareValue"
          label="Most valuable"
        />
        <lfx-dropdown-item
          v-if="type == 'projects'"
          value="healthScore"
          label="Healthiest"
        />
        <lfx-dropdown-item
          v-if="type == 'projects'"
          value="alphabetical"
          label="Alphabetically"
        />
      </lfx-dropdown-select>
    </section>
  </div>
  <!-- </lfx-maintain-height> -->
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import type { SortType } from '../services/osi.api.service';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  type?: string;
  view?: string;
  sort: SortType;
  isRoot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:type' | 'update:sort' | 'update:view', type: string): void;
}>();

const router = useRouter();
const route = useRoute();
const { openShareModal } = useShareStore();

const viewTabs = [
  {
    label: 'List',
    value: 'list',
    icon: 'list-ul',
  },
  {
    label: 'Distribution',
    value: 'distribution',
    icon: 'chart-tree-map',
  },
];

const sort = computed({
  get: () => props.sort,
  set: (value) => emit('update:sort', value),
});

const type = computed({
  get: () => props.type,
  set: (value) => emit('update:type', value),
});

const view = computed({
  get: () => props.view,
  set: (value) => emit('update:view', value),
});

const share = () => {
  const title = `Open Source Index | LFX Insights`;

  const url = new URL(window.location.href);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title,
  });
};

watch(sort, (newVal) => {
  if (newVal) {
    router.replace({
      ...route,
      query: {
        ...route.query,
        sort: newVal,
      },
    });
  }
});

watch(type, (newVal) => {
  if (newVal) {
    router.replace({
      ...route,
      query: {
        ...route.query,
        type: newVal,
      },
    });
  }
});

watch(view, (newVal) => {
  if (newVal) {
    router.replace({
      ...route,
      name: LfxRoutes.OPENSOURCEINDEX,
      query: {
        ...route.query,
        view: newVal,
      },
    });
  }
});

watch(
  () => props.type,
  (newVal) => {
    if (newVal !== 'projects') {
      sort.value = 'totalContributors';
    }
  },
);

watch(
  () => props.view,
  (val: string) => {
    if (val === 'distribution' && !['vertical', 'horizontal'].includes(type.value)) {
      type.value = 'horizontal';
    }
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxOsiHeader',
};
</script>
