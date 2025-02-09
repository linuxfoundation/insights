<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10">
        <p>Development</p>
      </div>
      <div class="w-1/2 flex flex-col gap-12">
        <lfx-project-issues-resolution />
        <lfx-project-pull-requests />
        <lfx-project-active-days />
        <lfx-project-contributions-outside-work-hours />
        <lfx-project-merge-lead-time />
        <lfx-project-forks-review-time-by-pull-request-size />
        <lfx-project-average-time-to-merge />
        <lfx-project-forks-wait-time-first-review />
        <lfx-project-code-review-engagement />
      </div>

      <div class="w-1/4 pl-10">
        <p>Feedback</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDevelopmentView',
}
</script>
