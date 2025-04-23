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
        <!--        <lfx-scroll-area-->
        <!--          class="flex flex-col gap-5 md:gap-8"-->
        <!--          @scrolled-to-view="onScrolledToView"-->
        <!--        >-->
        <!--          <template #default="{ observer }">-->
        <!--            <lfx-scroll-view-->
        <!--              id="contributors-leaderboard"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap>-->
        <!--                <lfx-project-contributors-leaderboard @show-full-list="onShowFullList" />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="organizations-leaderboard"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap>-->
        <!--                <lfx-project-organizations-leaderboard @show-full-list="onShowFullList" />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="active-contributors"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap :benchmark="activeContributorsBenchmark">-->
        <!--     <lfx-project-active-contributors @update:benchmark-value="activeContributorsBenchmark = $event" />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="active-organizations"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap>-->
        <!--                <lfx-project-active-organizations />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="contributor-dependency"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap :benchmark="contributorDependencyBenchmark">-->
        <!--<lfx-project-contributor-dependency @update:benchmark-value="contributorDependencyBenchmark = $event" />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="organization-dependency"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap :benchmark="organizationDependencyBenchmark">-->
        <!--                <lfx-project-organization-dependency-->
        <!--                  @update:benchmark-value="organizationDependencyBenchmark = $event"-->
        <!--                />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="retention"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap-->
        <!--                :benchmark="retentionBenchmark"-->
        <!--                :additional-check="retentionActiveTab === 'contributors'"-->
        <!--              >-->
        <!--                <lfx-project-retention @update:benchmark-value="onRetentionUpdate" />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!--            <lfx-scroll-view-->
        <!--              id="geographical-distribution"-->
        <!--              :observer="observer"-->
        <!--            >-->
        <!--              <lfx-benchmarks-wrap :benchmark="geographicalDistributionBenchmark">-->
        <!--                <lfx-project-geographical-distribution-->
        <!--                  :observer="observer"-->
        <!--                  @update:benchmark-value="geographicalDistributionBenchmark = $event"-->
        <!--                />-->
        <!--              </lfx-benchmarks-wrap>-->
        <!--            </lfx-scroll-view>-->
        <!-- <lfx-scroll-view id="industry-distribution" :observer="observer">
              <lfx-project-industry-distribution />
            </lfx-scroll-view> -->
        <!--          </template>-->
        <!--        </lfx-scroll-area>-->
      </div>

      <!--      <lfx-drawer-->
      <!--        v-model="isDrawerOpened"-->
      <!--        position="right"-->
      <!--      >-->
      <!--        <lfx-project-contributors-leaderboard-->
      <!--          v-if="selectedComponent === 'contributors-leaderboard'"-->
      <!--          :show-full-list="true"-->
      <!--          :selected-metric="selectedMetric"-->
      <!--        />-->
      <!--        <lfx-project-organizations-leaderboard-->
      <!--          v-if="selectedComponent === 'organizations-leaderboard'"-->
      <!--          :show-full-list="true"-->
      <!--          :selected-metric="selectedMetric"-->
      <!--        />-->
      <!--      </lfx-drawer>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import useScroll from '~/components/shared/utils/scroll';

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

</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsView'
};
</script>
