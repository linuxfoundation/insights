<template>
  <div class="container">
    <div class="flex justify-between pt-10">
      <div class="w-1/4 pr-10">
        <lfx-side-nav :list="sideNavItems" :model-value="activeItem" @update:model-value="onSideNavUpdate" />
      </div>

      <div class="w-1/2">
        <lfx-scroll-area class="flex flex-col gap-12" @scrolled-to-view="onScrolledToView">
          <template #default="{ observer }">
            <lfx-scroll-view id="active-contributors" :observer="observer">
              <lfx-project-active-contributors />
            </lfx-scroll-view>
            <lfx-scroll-view id="active-organizations" :observer="observer">
              <lfx-project-active-organizations />
            </lfx-scroll-view>
            <lfx-scroll-view id="contributors-leaderboard" :observer="observer">
              <lfx-project-contributors-leaderboard />
            </lfx-scroll-view>
            <lfx-scroll-view id="organizations-leaderboard" :observer="observer">
              <lfx-project-organizations-leaderboard />
            </lfx-scroll-view>
            <lfx-scroll-view id="contributor-dependency" :observer="observer">
              <lfx-project-contributor-dependency />
            </lfx-scroll-view>
            <lfx-scroll-view id="organization-dependency" :observer="observer">
              <lfx-project-organization-dependency />
            </lfx-scroll-view>
            <lfx-scroll-view id="retention" :observer="observer">
              <lfx-project-retention />
            </lfx-scroll-view>
            <!--            <lfx-scroll-view id="geographical-distribution" :observer="observer">-->
            <!--              <lfx-project-geographical-distribution />-->
            <!--            </lfx-scroll-view>-->
            <!-- <lfx-scroll-view id="industry-distribution" :observer="observer">
              <lfx-project-industry-distribution />
            </lfx-scroll-view> -->
          </template>
        </lfx-scroll-area>
      </div>

      <div class="w-1/4 pl-10" />
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
// import LfxProjectGeographicalDistribution
//   from '~/components/modules/project/components/contributors/geographical-distribution.vue';
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import LfxScrollView from '~/components/uikit/scroll-view/scroll-view.vue';
import LfxScrollArea from '~/components/uikit/scroll-view/scroll-area.vue';
import useScroll from '~/components/shared/utils/scroll';

const sideNavItems = [
  { label: 'Active Contributors', key: 'active-contributors' },
  { label: 'Active Organizations', key: 'active-organizations' },
  { label: 'Contributors Leaderboard', key: 'contributors-leaderboard' },
  { label: 'Organizations Leaderboard', key: 'organizations-leaderboard' },
  { label: 'Contributor Dependency', key: 'contributor-dependency' },
  { label: 'Organization Dependency', key: 'organization-dependency' },
  { label: 'Retention', key: 'retention' },
  { label: 'Geographical Distribution', key: 'geographical-distribution' },
  // { label: 'Industry Distribution', key: 'industry-distribution' }
];

const activeItem = ref('active-contributors');
const { scrollToTarget, scrollToTop } = useScroll();

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
  name: 'LfxProjectContributorsView'
};
</script>
