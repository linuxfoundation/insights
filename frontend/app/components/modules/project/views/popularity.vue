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

      <div class="w-3/4 pb-6 md:pb-10">
        <lfx-scroll-area
          class="flex flex-col gap-5 md:gap-8"
          @scrolled-to-view="onScrolledToView"
        >
          <template #default="{ observer }">
            <lfx-scroll-view
              id="stars"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="starsBenchmark">
                <lfx-project-stars @update:benchmark-value="starsBenchmark = $event" />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="forks"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="forksBenchmark">
                <lfx-project-forks @update:benchmark-value="forksBenchmark = $event" />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="social-mentions"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-social-mentions />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="github-mentions"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-github-mentions />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="press-mentions"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-press-mentions />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="search-queries"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-search-queries />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="package-downloads"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-package-downloads />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
          </template>
        </lfx-scroll-area>
      </div>
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
import LfxProjectSocialMentions from "~/components/modules/project/components/popularity/social-mentions.vue";
import LfxProjectGithubMentions from "~/components/modules/project/components/popularity/github-mentions.vue";
import LfxProjectPressMentions from "~/components/modules/project/components/popularity/press-mentions.vue";
import LfxProjectSearchQueries from "~/components/modules/project/components/popularity/search-queries.vue";
import LfxProjectPackageDownloads from "~/components/modules/project/components/popularity/package-downloads.vue";
import LfxBenchmarksWrap from '~/components/uikit/benchmarks/benchmarks-wrap.vue';
import type { Benchmark } from '~~/types/shared/benchmark.types';

const activeItem = ref('stars');
const tmpClickedItem = ref('');
const { scrollToTarget, scrollToTop } = useScroll();

const sideNavItems = [
  { label: 'Stars', key: 'stars' },
  { label: 'Forks', key: 'forks' },
  { label: 'Social Mentions', key: 'social-mentions' },
  { label: 'GitHub Mentions', key: 'github-mentions' },
  { label: 'Press Mentions', key: 'press-mentions' },
  { label: 'Search Queries', key: 'search-queries' },
  { label: 'Package Downloads', key: 'package-downloads' },
];

const starsBenchmark = ref<Benchmark | undefined>(undefined);
const forksBenchmark = ref<Benchmark | undefined>(undefined);

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
