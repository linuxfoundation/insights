<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10">
        <p>Contributors</p>
      </div>
      <div class="w-1/2 flex flex-col gap-12">
        <lfx-project-active-contributors />
        <lfx-project-active-organizations />
        <lfx-project-contributors-leaderboard />
        <lfx-project-organizations-leaderboard />
        <lfx-project-contributor-dependency />
        <lfx-project-organization-dependency />
        <lfx-project-retention />
        <lfx-project-geographical-distribution />
        <lfx-project-industry-distribution />
      </div>

      <div class="w-1/4 pl-10">
        <p>Feedback</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxProjectActiveContributors from "~/components/modules/project/components/contributors/active-contributors.vue";
import LfxProjectActiveOrganizations
  from "~/components/modules/project/components/contributors/active-organizations.vue";
import LfxProjectContributorsLeaderboard
  from "~/components/modules/project/components/contributors/contributors-leaderboard.vue";
import LfxProjectOrganizationsLeaderboard
  from "~/components/modules/project/components/contributors/organizations-leaderboard.vue";
import LfxProjectContributorDependency
  from "~/components/modules/project/components/contributors/contributor-dependency.vue";
import LfxProjectOrganizationDependency
  from "~/components/modules/project/components/contributors/organization-dependency.vue";
import LfxProjectRetention from "~/components/modules/project/components/contributors/retention.vue";
import LfxProjectGeographicalDistribution
  from "~/components/modules/project/components/contributors/geographical-distribution.vue";
import LfxProjectIndustryDistribution
  from "~/components/modules/project/components/contributors/industry-distribution.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsView',
}
</script>
