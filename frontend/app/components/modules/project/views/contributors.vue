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
              id="contributors-leaderboard"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-contributors-leaderboard />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="organizations-leaderboard"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-organizations-leaderboard />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="active-contributors"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-active-contributors />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="active-organizations"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-active-organizations />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="contributor-dependency"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="contributorDependencyBenchmark">
                <lfx-project-contributor-dependency @update:benchmark-value="contributorDependencyBenchmark = $event" />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="organization-dependency"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-organization-dependency />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="retention"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-retention />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="geographical-distribution"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="organizationsLeaderboardBenchmark">
                <lfx-project-geographical-distribution :observer="observer" />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <!-- <lfx-scroll-view id="industry-distribution" :observer="observer">
              <lfx-project-industry-distribution />
            </lfx-scroll-view> -->
          </template>
        </lfx-scroll-area>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxProjectActiveContributors
  from '~/components/modules/project/components/contributors/active-contributors.vue';
import LfxProjectActiveOrganizations
  from '~/components/modules/project/components/contributors/active-organizations.vue';
import LfxProjectContributorsLeaderboard
  from '~/components/modules/project/components/contributors/contributors-leaderboard.vue';
import LfxProjectOrganizationsLeaderboard
  from '~/components/modules/project/components/contributors/organizations-leaderboard.vue';
import LfxProjectContributorDependency
  from '~/components/modules/project/components/contributors/contributor-dependency.vue';
import LfxProjectOrganizationDependency
  from '~/components/modules/project/components/contributors/organization-dependency.vue';
import LfxProjectRetention
  from '~/components/modules/project/components/contributors/retention.vue';
import LfxProjectGeographicalDistribution
  from '~/components/modules/project/components/contributors/geographical-distribution.vue';
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import LfxScrollView from '~/components/uikit/scroll-view/scroll-view.vue';
import LfxScrollArea from '~/components/uikit/scroll-view/scroll-area.vue';
import useScroll from '~/components/shared/utils/scroll';
import LfxBenchmarksWrap from '~/components/uikit/benchmarks/benchmarks-wrap.vue';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';

const sideNavItems = [
  { label: 'Contributors Leaderboard', key: 'contributors-leaderboard' },
  { label: 'Organizations Leaderboard', key: 'organizations-leaderboard' },
  { label: 'Active Contributors', key: 'active-contributors' },
  { label: 'Active Organizations', key: 'active-organizations' },
  { label: 'Contributor Dependency', key: 'contributor-dependency' },
  { label: 'Organization Dependency', key: 'organization-dependency' },
  { label: 'Retention', key: 'retention' },
  { label: 'Geographical Distribution', key: 'geographical-distribution' },
  // { label: 'Industry Distribution', key: 'industry-distribution' }
];
const contributorDependencyBenchmark = ref<Benchmark>({
  key: BenchmarkKeys.ContributorDependency,
  value: 0
});

const organizationsLeaderboardBenchmark = {
  key: BenchmarkKeys.OrganizationsLeaderboard,
  value: 100
};

const activeItem = ref('active-contributors');
const tmpClickedItem = ref('');
const { scrollToTarget, scrollToTop } = useScroll();

const onSideNavUpdate = (value: string) => {
  tmpClickedItem.value = value;
  if (value === sideNavItems[0]?.key) {
    scrollToTop();
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
  name: 'LfxProjectContributorsView'
};
</script>
