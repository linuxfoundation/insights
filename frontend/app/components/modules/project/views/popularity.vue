<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10">
        <p>Popularity</p>
      </div>
      <div class="w-1/2 flex flex-col gap-12">
        <lfx-project-stars />
        <lfx-project-forks />
        <!-- <lfx-project-social-mentions />
        <lfx-project-github-mentions />
        <lfx-project-press-mentions />
        <lfx-project-search-queries />
        <lfx-project-package-downloads /> -->
      </div>

      <div class="w-1/4 pl-10">

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import LfxProjectStars from "~/components/modules/project/components/popularity/stars.vue";
import LfxProjectForks from "~/components/modules/project/components/popularity/forks.vue";
// import LfxProjectSocialMentions from "~/components/modules/project/components/popularity/social-mentions.vue";
// import LfxProjectGithubMentions from "~/components/modules/project/components/popularity/github-mentions.vue";
// import LfxProjectPressMentions from "~/components/modules/project/components/popularity/press-mentions.vue";
// import LfxProjectSearchQueries from "~/components/modules/project/components/popularity/search-queries.vue";
// import LfxProjectPackageDownloads from "~/components/modules/project/components/popularity/package-downloads.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPopularityView',
}
</script>
