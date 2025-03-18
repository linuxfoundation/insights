<template>
  <div class="container !px-5 lg:!px-10">
    <div class="flex justify-between pt-5 md:pt-10">
      <div class="w-1/4 pr-5 min-w-50 xl:pr-10 max-md:hidden block">
        <lfx-side-nav
          :list="sideNavItems"
          :model-value="activeItem"
          @update:model-value="onSideNavUpdate"
        />
      </div>

      <div class="max-lg:w-full w-1/2 pb-6 md:pb-10">
        <lfx-scroll-area
          class="flex flex-col gap-5 md:gap-8"
          @scrolled-to-view="onScrolledToView"
        >
          <template #default="{ observer }">
            <lfx-scroll-view
              id="stars"
              :observer="observer"
            >
              <lfx-project-stars />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="forks"
              :observer="observer"
            >
              <lfx-project-forks />
            </lfx-scroll-view>
          </template>
        </lfx-scroll-area>
        <!-- <lfx-project-social-mentions />
        <lfx-project-github-mentions />
        <lfx-project-press-mentions />
        <lfx-project-search-queries />
        <lfx-project-package-downloads /> -->
      </div>

      <div class="w-1/4 pl-5 xl:pl-10 max-lg:hidden block" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxProjectStars from "~/components/modules/project/components/popularity/stars.vue";
import LfxProjectForks from "~/components/modules/project/components/popularity/forks.vue";
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import LfxScrollView from '~/components/uikit/scroll-view/scroll-view.vue';
import LfxScrollArea from '~/components/uikit/scroll-view/scroll-area.vue';
import useScroll from '~/components/shared/utils/scroll';
// import LfxProjectSocialMentions from "~/components/modules/project/components/popularity/social-mentions.vue";
// import LfxProjectGithubMentions from "~/components/modules/project/components/popularity/github-mentions.vue";
// import LfxProjectPressMentions from "~/components/modules/project/components/popularity/press-mentions.vue";
// import LfxProjectSearchQueries from "~/components/modules/project/components/popularity/search-queries.vue";
// import LfxProjectPackageDownloads from "~/components/modules/project/components/popularity/package-downloads.vue";

const activeItem = ref('stars');
const tmpClickedItem = ref('');
const { scrollToTarget, scrollToTop } = useScroll();

const sideNavItems = [
  { label: 'Stars', key: 'stars' },
  { label: 'Forks', key: 'forks' },
];

const onSideNavUpdate = (value: string) => {
  tmpClickedItem.value = value;
  if (value === sideNavItems[0]?.key) {
    scrollToTop(undefined);
  } else {
    const element = document.getElementById(value);
    if (element) {
      scrollToTarget(element);
    }
  }
  activeItem.value = value;

  // wait for the scroll to complete
  setTimeout(() => {
    tmpClickedItem.value = '';
  }, 1000);
};

const onScrolledToView = (value: string) => {
  if (tmpClickedItem.value === '') {
    activeItem.value = value;
  }
};

</script>

<script lang="ts">
export default {
  name: 'LfxProjectPopularityView',
}
</script>
