<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-maintain-height
    :scroll-top="scrollTop"
    :class="scrollTop > 0 ? 'fixed top-28 sm:top-21 lg:top-24' : 'relative'"
    class="z-10 w-full"
    :loaded="pageWidth > 0"
  >
    <div class="bg-white outline outline-1 outline-neutral-200">
      <section class="container">
        <div
          class="ease-linear transition-all"
          :class="scrollTop > 50 ? 'py-3 md:py-4' : 'py-3 md:py-6'"
        >
          <div class="flex items-center flex-row justify-between gap-2 flex-wrap">
            <div
              class="flex sm:items-center items-stretch min-w-0 max-w-full
              sm:flex-nowrap flex-wrap sm:w-auto"
            >
              <div class="flex items-center grow sm:max-w-none max-w-full">
                <lfx-back class="ease-linear transition-all pr-1 sm:pr-4">
                  <lfx-icon-button
                    type="transparent"
                    icon="angle-left"
                    class=""
                  />
                </lfx-back>
                <lfx-organization-logo
                  class="mr-4 max-h-8 md:max-h-12"
                  :src="props.project?.logo || ''"
                  :size="scrollTop > 50 ? 'normal' : ((pageWidth < 768 && pageWidth > 0) ? 'normal' : 'large')"
                  :is-lf="!!props.project?.isLF"
                />

                <h1
                  class="font-bold mr-3 ease-linear transition-all
                  font-secondary duration-200 text-heading-4 line-clamp-1 sm:max-w-[25ch] truncate"
                  :class="[
                    scrollTop > 50 ? 'md:text-heading-3' : 'md:text-heading-2'
                  ]"
                >
                  {{ props.project?.name }}
                </h1>
                <span
                  v-if="(props.project?.repositories?.length ?? 0) > 0"
                  class="mr-1 text-neutral-400 font-secondary leading-8 ease-linear transition-all text-2xl"
                >/</span>
              </div>
              <div
                v-if="(props.project?.repositories?.length ?? 0) > 0"
                class="flex items-center gap-3 cursor-pointer px-2 py-0.5
              rounded-lg transition hover:bg-neutral-100 min-w-0"
                @click="isSearchRepoModalOpen = true"
              >
                <p
                  class="text-neutral-400 leading-8 ease-linear transition-all text-base w-full overflow-hidden"
                  :class="scrollTop > 50 ? 'md:text-xl' : 'md:text-2xl'"
                >
                  <span
                    v-if="selectedRepositoryGroup"
                    class="font-secondary block text-neutral-900 sm:max-w-[25ch] truncate"
                  >{{ selectedRepositoryGroup.name }}</span>
                  <span
                    v-else-if="repoName"
                    class="font-secondary block text-neutral-900 sm:max-w-[25ch] truncate"
                  >{{ repoName }}</span>
                  <span
                    v-else
                    class="font-secondary text-neutral-500 w-full block overflow-hidden truncate"
                  >All repositories</span>
                </p>
                <lfx-archived-tag
                  v-if="!selectedRepositoryGroup && hasSelectedArchivedRepos"
                  :archived="true"
                  :label="archivedRepoLabel"
                  class="hidden md:block"
                  @click="isSearchRepoModalOpen = true"
                />
                <lfx-tag
                  v-if="selectedRepositoryGroup"
                  type="outline"
                  size="small"
                  class="whitespace-nowrap !hidden md:!flex"
                >
                  <lfx-icon
                    name="book"
                    :size="12"
                  />
                  {{pluralize('repository', selectedRepositoryGroup.repositories.length, true)}}
                </lfx-tag>
                <lfx-icon
                  name="angles-up-down"
                  :size="12"
                  class="text-neutral-400"
                />
              </div>
            </div>
            <div class="hidden sm:flex items-center gap-4 flex-grow justify-end">
              <lfx-icon-button
                icon="comment-exclamation"
                size="medium"
                class="!text-warning-600"
                title="Report issue"
                @click="openReportModal()"
              />
              <lfx-icon-button
                icon="link-simple"
                size="medium"
                title="Share"
                @click="share()"
              />
              <lfx-button
                v-if="hasLfxInsightsPermission"
                type="tertiary"
                class="!rounded-full !text-nowrap"
                @click="openCopilotHandler()"
              >
                <lfx-icon name="sparkles" />
                Ask Copilot
              </lfx-button>
            </div>
          </div>
        </div>
        <div
          class="
            flex justify-between items-center transition-all overflow-auto
            -mx-5 sm:-mx-0.5 px-5 sm:px-0.5 py-3
          "
          :class="scrollTop > 50 ? 'md:py-4' : 'md:py-5'"
        >
          <lfx-project-menu :project="props.project" />
          <teleport
            v-if="pageWidth < 768"
            to="body"
          >
            <div
              class="fixed bottom-5 z-50 left-1/2 transform -translate-x-1/2
           bg-white border border-neutral-200 rounded-full shadow-md px-1 py-px gap-2 flex"
            >
              <lfx-project-date-range-picker  v-show="showDatepicker" />
              <div
                v-if="showDatepicker"
                class="border-l border-neutral-200 my-1"
              />
              <div
                class="flex items-center py-1.5 px-3 gap-1.5 cursor-pointer"
                @click="share()"
              >
                <lfx-icon
                  name="share-nodes"
                  :size="14"
                />
                <p class="text-xs whitespace-nowrap">Share</p>
              </div>
              <div class="border-l border-neutral-200 my-1" />
              <div
                class="flex items-center py-1.5 px-3 gap-1.5 cursor-pointer"
                @click="openReportModal()"
              >
                <lfx-icon
                  name="comment-exclamation"
                  :size="14"
                  class="text-warning-600"
                />
                <p class="text-xs whitespace-nowrap">Report issue</p>
              </div>
            </div>
          </teleport>
          <lfx-project-date-range-picker
            v-else
            v-show="showDatepicker"
          />
        </div>
      </section>
    </div>
  </lfx-maintain-height>
  <lfx-project-repository-switch
    v-if="isSearchRepoModalOpen && props.project"
    v-model="isSearchRepoModalOpen"
  />
</template>

<script lang="ts" setup>
import {useRoute} from 'nuxt/app';
import {computed} from 'vue';
import {storeToRefs} from "pinia";
import pluralize from "pluralize";
import type {Project, ProjectRepository} from "~~/types/project";
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import useScroll from "~/components/shared/utils/scroll";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxProjectRepositorySwitch from "~/components/modules/project/components/shared/header/repository-switch.vue";
import LfxBack from "~/components/uikit/back/back.vue";
import LfxProjectDateRangePicker from "~/components/modules/project/components/shared/header/date-range-picker.vue";
import LfxMaintainHeight from "~/components/uikit/maintain-height/maintain-height.vue";
import useResponsive from "~/components/shared/utils/responsive";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxOrganizationLogo from "~/components/uikit/organization-logo/organization-logo.vue";
import LfxProjectMenu from "~/components/modules/project/components/shared/header/project-menu.vue";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
import {useShareStore} from "~/components/shared/modules/share/store/share.store";
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import {useAuthStore} from "~/components/modules/auth/store/auth.store";
import {useCopilotStore} from "~/components/shared/modules/copilot/store/copilot.store";
import LfxTag from "~/components/uikit/tag/tag.vue";

const props = defineProps<{
  project?: Project
}>();

const route = useRoute();

const {
  projectRepos,
  selectedRepoSlugs,
  selectedRepositories,
  allArchived,
  hasSelectedArchivedRepos,
    selectedRepositoryGroup,
} = storeToRefs(useProjectStore());
const { openReportModal } = useReportStore();
const { openShareModal } = useShareStore();
const { openCopilotModal } = useCopilotStore();

const {hasLfxInsightsPermission} = storeToRefs(useAuthStore())

const repos = computed<ProjectRepository[]>(
    () => projectRepos.value.filter((repo) => selectedRepoSlugs.value.includes(repo.slug))
);
const repoName = computed<string>(() => {
  if (repos.value.length === 0) {
    return '';
  }
  if (repos.value.length === 1) {
    return repos.value[0]!.name.split('/').at(-1) || '';
  }
  return `${repos.value.length} repositories`;
})

const archivedRepoLabel = computed<string>(() => {
  if (allArchived.value) {
    return "Archived";
  }

  return "Inc. archived repositories";
})

const isSearchRepoModalOpen = ref(false);

const {scrollTop} = useScroll();
const {pageWidth} = useResponsive();

const share = () => {
  const title = [];
  if (props.project?.name) {
    title.push(props.project.name);
    if(selectedRepositories.value.length > 1){
      title.push(`${selectedRepositories.value.length} repositories`);
    } else if(selectedRepositories.value.length === 1){
      title.push(selectedRepositories.value[0]!.name);
    }

    const type = route.path.split('/').at(-1) || '';
    if(['contributors', 'popularity', 'security', 'development'].includes(type)){
      title.push(type);
    }
    title.push('insights | LFX Insights');
  }
  else {
    title.push(document.title);
  }

  const finalTitle = `${title.join(' ')}`;

  const url = new URL(window.location.href);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title: finalTitle,
    showGithubBadge: true,
    activeTab: 'link'
  })
};

const showDatepicker = computed(() => ![
    LfxRoutes.PROJECT,
    LfxRoutes.REPOSITORY,
    LfxRoutes.PROJECT_SECURITY,
    LfxRoutes.REPOSITORY_SECURITY,
    LfxRoutes.REPOSITORY_GROUP,
    LfxRoutes.REPOSITORY_GROUP_SECURITY,
  ].includes(route.name as LfxRoutes));


const openCopilotHandler = () => {
  openCopilotModal({
    suggestions: '',
    project: props.project || undefined
  });
}
</script>

<script lang="ts">
export default {
  name: 'LfxProjectHeader'
};
</script>
