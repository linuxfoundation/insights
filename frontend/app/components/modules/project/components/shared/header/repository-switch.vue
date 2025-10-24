<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    content-class="flex w-full justify-stretch items-stretch relative !overflow-visible"
    show-close-button
    width="37.5rem"
  >
    <div class="absolute top-2 -right-10">
      <lfx-icon-button
        icon="close"
        size="small"
        @click="isModalOpen = false"
      />
    </div>
    <div class="p-1 flex flex-col gap-1 w-full min-w-[30rem]">
      <lfx-project-repository-switch-item
        :selected="selectedRepoSlugs.length === 0 && !selectedRepositoryGroup"
        @click="allRepositories()"
      >
        <div class="flex items-center gap-1.5">
          <lfx-icon
            name="books"
            :size="16"
            class="text-neutral-400"
          />
          <p class="text-sm">All repositories</p>
        </div>
      </lfx-project-repository-switch-item>

      <!-- Search input -->
      <hr />
      <div
        v-if="projectRepositoryGroups.length > 0"
        class="p-3"
      >
        <lfx-tabs
          v-model="tab"
          :tabs="tabs"
        >
          <template #slotItem="{ option }">
            <div class="flex items-center gap-2">
              <lfx-icon
                v-if="option.icon"
                :name="option.icon"
                :size="14"
              />
              <p>
                {{ option.label }}
              </p>
            </div>
          </template>
        </lfx-tabs>
      </div>
      <lfx-project-repository-search
        v-if="tab === 'repositories'"
        :link="routeName"
        @close="isModalOpen = false"
      />
      <lfx-project-repository-group-search
        v-else-if="tab === 'repository-groups'"
        :link="routeName"
        @close="isModalOpen = false"
      />
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'nuxt/app';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxProjectRepositorySearch from '~/components/modules/project/components/shared/header/repository-switch/repository-search.vue';
import LfxProjectRepositoryGroupSearch from '~/components/modules/project/components/shared/header/repository-switch/repository-group-search.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxProjectRepositorySwitchItem from '~/components/modules/project/components/shared/header/repository-switch/repository-switch-item.vue';
import { lfProjectLinks, type ProjectLinkConfig } from '~/components/modules/project/config/links';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const route = useRoute();
const router = useRouter();

const { projectRepositoryGroups, selectedRepoSlugs, selectedRepositoryGroup } = storeToRefs(useProjectStore());

const tab = ref('repositories');

const tabs = [
  { label: 'Repositories', value: 'repositories', icon: 'book' },
  { label: 'Repository groups', value: 'repository-groups', icon: 'list-tree' },
];

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const routeName = computed<ProjectLinkConfig>(() => {
  const type: string = (route.name || '').split('-').at(-1);
  const link = lfProjectLinks.find((l) => l.key === type);
  const overview = lfProjectLinks.find((l) => l.key === 'overview');

  return link || overview;
});

const allRepositories = () => {
  isModalOpen.value = false;
  const routeQuery = route.query;

  router.push({
    name: routeName.value.projectRouteName,
    params: {
      slug: route.params.slug,
    },
    query: { ...routeQuery, repos: undefined },
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySwitch',
};
</script>
