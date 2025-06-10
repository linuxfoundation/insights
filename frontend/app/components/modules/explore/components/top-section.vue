<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <lfx-explore-top-projects />
    <lfx-explore-top-contributors />
    <lfx-explore-top-organizations />
  </section>
</template>

<script setup lang="ts">
import LfxExploreTopProjects from '~/components/modules/explore/components/top-projects.vue';
import LfxExploreTopContributors from '~/components/modules/explore/components/top-contributors.vue';
import LfxExploreTopOrganizations from '~/components/modules/explore/components/top-organizations.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopSection'
};
</script>
