<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container flex flex-col gap-10 md:gap-16">
    <lfx-explore-header />
    <lfx-explore-top-section />
    <lfx-explore-source-index-section />
    <lfx-explore-featured-collection />
  </div>
</template>

<script setup lang="ts">
import LfxExploreHeader from '~/components/modules/explore/components/explore-header.vue';
import LfxExploreTopSection from '~/components/modules/explore/components/top-section.vue';
import LfxExploreSourceIndexSection from '~/components/modules/explore/components/source-index-section.vue';
import LfxExploreFeaturedCollection from '~/components/modules/explore/components/featured-collection.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxExplore'
};
</script>
