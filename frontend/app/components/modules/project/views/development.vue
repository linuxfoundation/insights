<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
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
              id="issues-resolution"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="issuesResolutionBenchmark">
                <lfx-project-issues-resolution
                  :additional-check="issuesResolutionGranularity === Granularity.WEEKLY"
                  @update:benchmark-value="onIssuesResolutionUpdate"
                />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="issues-opened"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-issues-opened />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="pull-requests"
              :observer="observer"
            >
              <lfx-benchmarks-wrap
                :benchmark="pullRequestsBenchmark"
                :additional-check="pullRequestsGranularity === Granularity.MONTHLY"
              >
                <lfx-project-pull-requests
                  @update:benchmark-value="onPullRequestsUpdate"
                />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="active-days"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="activeDaysBenchmark">
                <lfx-project-active-days
                  :additional-check="activeDaysGranularity === Granularity.DAILY"
                  @update:benchmark-value="onActiveDaysUpdate"
                />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="contributions-outside-work-hours"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-contributions-outside-work-hours />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="merge-lead-time"
              :observer="observer"
            >
              <lfx-benchmarks-wrap :benchmark="mergeLeadTimeBenchmark">
                <lfx-project-merge-lead-time
                  @update:benchmark-value="mergeLeadTimeBenchmark = $event"
                />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="review-time-by-pull-request-size"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-forks-review-time-by-pull-request-size />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="average-time-to-merge"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-average-time-to-merge />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="wait-time-first-review"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-wait-time-first-review />
              </lfx-benchmarks-wrap>
            </lfx-scroll-view>
            <lfx-scroll-view
              id="code-review-engagement"
              :observer="observer"
            >
              <lfx-benchmarks-wrap>
                <lfx-project-code-review-engagement />
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
import LfxProjectIssuesResolution from "~/components/modules/project/components/development/issues-resolution.vue";
import LfxProjectIssuesOpened from "~/components/modules/project/components/development/issues-opened.vue";
import LfxProjectPullRequests from "~/components/modules/project/components/development/pull-requests.vue";
import LfxProjectActiveDays from "~/components/modules/project/components/development/active-days.vue";
import LfxProjectContributionsOutsideWorkHours
  from "~/components/modules/project/components/development/contributions-outside-work-hours.vue";
import LfxProjectMergeLeadTime from "~/components/modules/project/components/development/merge-lead-time.vue";
import LfxProjectForksReviewTimeByPullRequestSize
  from "~/components/modules/project/components/development/review-time-by-pull-request-size.vue";
import LfxProjectAverageTimeToMerge
  from "~/components/modules/project/components/development/average-time-to-merge.vue";
import LfxProjectWaitTimeFirstReview
  from "~/components/modules/project/components/development/wait-time-first-review.vue";
import LfxProjectCodeReviewEngagement
  from "~/components/modules/project/components/development/code-review-engagement.vue";
import LfxSideNav from '~/components/uikit/side-nav/side-nav.vue';
import LfxScrollView from '~/components/uikit/scroll-view/scroll-view.vue';
import LfxScrollArea from '~/components/uikit/scroll-view/scroll-area.vue';
import useScroll from '~/components/shared/utils/scroll';
import LfxBenchmarksWrap from '~/components/uikit/benchmarks/benchmarks-wrap.vue';
import type { Benchmark } from '~~/types/shared/benchmark.types';
import { Granularity } from '~~/types/shared/granularity';

const activeItem = ref('issues-resolution');
const tmpClickedItem = ref('');
const { scrollToTarget, scrollToTop } = useScroll();

const sideNavItems = [
  { label: 'Issues Resolution', key: 'issues-resolution' },
  { label: 'Issues Opened', key: 'issues-opened' },
  { label: 'Pull Requests', key: 'pull-requests' },
  { label: 'Active Days', key: 'active-days' },
  { label: 'Contributions Outside Work Hours', key: 'contributions-outside-work-hours' },
  { label: 'Merge Lead Time', key: 'merge-lead-time' },
  { label: 'Review Time by Pull Request Size', key: 'review-time-by-pull-request-size' },
  { label: 'Average Time to Merge', key: 'average-time-to-merge' },
  { label: 'Wait Time First Review', key: 'wait-time-first-review' },
  { label: 'Code Review Engagement', key: 'code-review-engagement' },
];

const issuesResolutionBenchmark = ref<Benchmark | undefined>(undefined);
const issuesResolutionGranularity = ref<string>('');
const activeDaysBenchmark = ref<Benchmark | undefined>(undefined);
const activeDaysGranularity = ref<string>('');
const mergeLeadTimeBenchmark = ref<Benchmark | undefined>(undefined);
const pullRequestsBenchmark = ref<Benchmark | undefined>(undefined);
const pullRequestsGranularity = ref<string>('');

const onSideNavUpdate = (value: string) => {
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

const onIssuesResolutionUpdate = (value: Benchmark, granularity: string) => {
  issuesResolutionBenchmark.value = value;
  issuesResolutionGranularity.value = granularity;
};

const onActiveDaysUpdate = (value: Benchmark, granularity: string) => {
  activeDaysBenchmark.value = value;
  activeDaysGranularity.value = granularity;
};

const onPullRequestsUpdate = (value: Benchmark, granularity: string) => {
  pullRequestsBenchmark.value = value;
  pullRequestsGranularity.value = granularity;
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDevelopmentView',
}
</script>
