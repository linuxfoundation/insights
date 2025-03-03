<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10">
        <lfx-side-nav
          :list="sideNavItems"
          :model-value="activeItem"
          @update:model-value="onSideNavUpdate"
        />
      </div>
      <div class="w-1/2">
        <lfx-scroll-area
          class="flex flex-col gap-12"
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

      <div class="w-1/4 pl-10" />
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
const { scrollToTarget, scrollToTop } = useScroll();

const sideNavItems = [
  { label: 'Stars', key: 'stars' },
  { label: 'Forks', key: 'forks' },
];

const onSideNavUpdate = (value: string) => {
  if (value === sideNavItems[0]?.key) {
    scrollToTop();
  } else {
    const element = document.getElementById(value);
    if (element) {
      scrollToTarget(element);
    }
  }
};

const onScrolledToView = (value: string) => {
  activeItem.value = value;
};

</script>

<script lang="ts">
export default {
  name: 'LfxProjectPopularityView',
}
</script>
