<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10 max-md:hidden block">
        <lfx-side-nav
          :list="sideNavItems"
          :model-value="activeItem"
          @update:model-value="onSideNavUpdate"
        />
      </div>
      <div class="max-lg:w-full w-1/2 pb-10">
        <lfx-scroll-area
          class="flex flex-col gap-12"
          @scrolled-to-view="onScrolledToView"
        >
          <template #default="{ observer }">
            <lfx-scroll-view
              id="issues-resolution"
              :observer="observer"
            >
              <lfx-project-issues-resolution />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="pull-requests"
              :observer="observer"
            >
              <lfx-project-pull-requests />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="active-days"
              :observer="observer"
            >
              <lfx-project-active-days />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="contributions-outside-work-hours"
              :observer="observer"
            >
              <lfx-project-contributions-outside-work-hours />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="merge-lead-time"
              :observer="observer"
            >
              <lfx-project-merge-lead-time />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="review-time-by-pull-request-size"
              :observer="observer"
            >
              <lfx-project-forks-review-time-by-pull-request-size />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="average-time-to-merge"
              :observer="observer"
            >
              <lfx-project-average-time-to-merge />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="wait-time-first-review"
              :observer="observer"
            >
              <lfx-project-forks-wait-time-first-review />
            </lfx-scroll-view>
            <lfx-scroll-view
              id="code-review-engagement"
              :observer="observer"
            >
              <lfx-project-code-review-engagement />
            </lfx-scroll-view>
          </template>
        </lfx-scroll-area>
      </div>

      <div class="w-1/4 pl-10 max-lg:hidden block" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxProjectIssuesResolution from "~/components/modules/project/components/development/issues-resolution.vue";
import LfxProjectPullRequests from "~/components/modules/project/components/development/pull-requests.vue";
import LfxProjectActiveDays from "~/components/modules/project/components/development/active-days.vue";
import LfxProjectContributionsOutsideWorkHours
  from "~/components/modules/project/components/development/contributions-outside-work-hours.vue";
import LfxProjectMergeLeadTime from "~/components/modules/project/components/development/merge-lead-time.vue";
import LfxProjectForksReviewTimeByPullRequestSize
  from "~/components/modules/project/components/development/review-time-by-pull-request-size.vue";
import LfxProjectAverageTimeToMerge
  from "~/components/modules/project/components/development/average-time-to-merge.vue";
import LfxProjectForksWaitTimeFirstReview
  from "~/components/modules/project/components/development/wait-time-first-review.vue";
import LfxProjectCodeReviewEngagement
  from "~/components/modules/project/components/development/code-review-engagement.vue";
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import LfxScrollView from '~/components/uikit/scroll-view/scroll-view.vue';
import LfxScrollArea from '~/components/uikit/scroll-view/scroll-area.vue';
import useScroll from '~/components/shared/utils/scroll';

const activeItem = ref('stars');
const { scrollToTarget, scrollToTop } = useScroll();

const sideNavItems = [
  { label: 'Issues Resolution', key: 'issues-resolution' },
  { label: 'Pull Requests', key: 'pull-requests' },
  { label: 'Active Days', key: 'active-days' },
  { label: 'Contributions Outside Work Hours', key: 'contributions-outside-work-hours' },
  { label: 'Merge Lead Time', key: 'merge-lead-time' },
  { label: 'Review Time by Pull Request Size', key: 'review-time-by-pull-request-size' },
  { label: 'Average Time to Merge', key: 'average-time-to-merge' },
  { label: 'Wait Time First Review', key: 'wait-time-first-review' },
  { label: 'Code Review Engagement', key: 'code-review-engagement' },
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
  name: 'LfxProjectDevelopmentView',
}
</script>
