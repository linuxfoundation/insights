<template>
  <lfx-maintain-height class="sticky top-14 lg:top-17 z-10">
    <div class="bg-white outline outline-neutral-200">
      <section class="container">
        <div
          v-if="props.project"
          class="ease-linear transition-all"
          :class="scrollTop > 50 ? 'py-3 md:py-4' : 'py-3 md:py-6'"
        >

          <div class="flex items-center justify-between ">
            <div class="flex items-center">
              <lfx-back class="ease-linear transition-all pr-4">
                <lfx-icon-button
                  type="transparent"
                  icon="angle-left"
                  class=""
                />
              </lfx-back>
              <lfx-avatar
                type="organization"
                :size="scrollTop > 50 ? 'normal' : (pageWidth < 768 ? 'normal' : 'large')"
                class="mr-4"
                :src="props.project.logo || ''"
              />
              <h1
                class="font-bold mr-3 ease-linear transition-all font-secondary duration-200 text-heading-4"
                :class="scrollTop > 50 ? 'md:text-heading-3' : 'md:text-heading-2'"
              >
                {{ props.project.name }}
              </h1>
              <span
                class="mr-1 text-neutral-400 font-secondary leading-8 ease-linear transition-all text-2xl"
              >/</span>
              <div
                class="flex items-center gap-2 cursor-pointer px-2 py-0.5
              rounded-lg transition hover:bg-neutral-100"
                @click="isSearchRepoModalOpen = true"
              >
                <p
                  class="text-neutral-400 leading-8 ease-linear transition-all text-base"
                  :class="scrollTop > 50 ? 'md:text-xl' : 'md:text-2xl'"
                >
                  <span
                    v-if="repoName"
                    class="font-secondary"
                  >{{ repoName }}</span>
                  <span
                    v-else
                    class="font-secondary"
                  >All repositories</span>
                </p>
                <lfx-icon
                  name="angles-up-down"
                  :size="12"
                  class="text-neutral-400"
                />
              </div>
            </div>
            <div class="hidden sm:block">
              <lfx-share>
                <lfx-button
                  type="tertiary"
                  class="!rounded-full"
                >
                  <lfx-icon name="link-simple" />
                  Share
                </lfx-button>
              </lfx-share>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between items-center transition-all overflow-auto gap-3 -mx-5 sm:mx-0 px-5 sm:px-0 py-3"
          :class="scrollTop > 50 ? 'md:py-4' : 'md:py-5'"
        >
          <div class="flex items-center gap-3">
            <!--            <lfx-menu-button-->
            <!--              :to="{ name: repoName ? LfxRoutes.REPOSITORY : LfxRoutes.PROJECT }"-->
            <!--              exact>-->
            <!--              <lfx-icon name="gauge-high" />-->
            <!--              Overview-->
            <!--            </lfx-menu-button>-->
            <lfx-menu-button
              :to="{
                name: repoName ? LfxRoutes.REPOSITORY : LfxRoutes.PROJECT
              }"
              exact
            >
              <lfx-icon name="people-group" />
              Contributors
            </lfx-menu-button>
            <lfx-menu-button
              :to="{
                name: repoName ? LfxRoutes.REPOSITORY_POPULARITY : LfxRoutes.PROJECT_POPULARITY
              }"
            >
              <lfx-icon name="fire" />
              Popularity
            </lfx-menu-button>
            <!--            <lfx-menu-button-->
            <!--              :to="{-->
            <!--                name: repoName ? LfxRoutes.REPOSITORY_DEVELOPMENT : LfxRoutes.PROJECT_DEVELOPMENT-->
            <!--              }"-->
            <!--            >-->
            <!--              <lfx-icon name="code" />-->
            <!--              Development-->
            <!--            </lfx-menu-button>-->
            <!--            <lfx-menu-button-->
            <!--              :to="{ name: repoName ? LfxRoutes.REPOSITORY_SECURITY : LfxRoutes.PROJECT_SECURITY }">-->
            <!--              <lfx-icon name="shield-check" />-->
            <!--              Security & Best Practices-->
            <!--            </lfx-menu-button>-->
          </div>
          <lfx-project-date-range-picker />
        </div>
      </section>
    </div>
  </lfx-maintain-height>
  <lfx-project-repository-switch
    v-if="isSearchRepoModalOpen && props.project"
    v-model="isSearchRepoModalOpen"
    :repo="repoName"
    :project="props.project"
  />
</template>

<script lang="ts" setup>
import {useRoute} from 'nuxt/app';
import {computed} from 'vue';
import type {Project} from "~~/types/project";
import {LfxRoutes} from '~/components/shared/types/routes';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import useScroll from "~/components/shared/utils/scroll";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxShare from "~/components/uikit/share/share.vue";
import LfxProjectRepositorySwitch from "~/components/modules/project/components/shared/header/repository-switch.vue";
import LfxBack from "~/components/uikit/back/back.vue";
import LfxProjectDateRangePicker from "~/components/modules/project/components/shared/header/date-range-picker.vue";
import LfxMaintainHeight from "~/components/uikit/maintain-height/maintain-height.vue";
import useResponsive from "~/components/shared/utils/responsive";

const props = defineProps<{
  project: Project
}>();

const route = useRoute();

const repoName = computed<string>(() => route.params.name as string);

const isSearchRepoModalOpen = ref(false);

const {scrollTop} = useScroll();
const {pageWidth} = useResponsive();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectHeader'
};
</script>
