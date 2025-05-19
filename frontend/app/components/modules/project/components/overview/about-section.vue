<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <lfx-project-about-software-value />
    <lfx-tags-and-languages />
    <lfx-links />
    <!-- <lfx-associated-organization /> -->
    <lfx-project-about-section-connected-platforms />
  </div>
</template>

<script setup lang="ts">
import LfxProjectAboutSoftwareValue from './about-section/about-software-value.vue';
import LfxTagsAndLanguages from './about-section/tags-ang-languages.vue';
import LfxLinks from './about-section/links.vue';
import LfxProjectAboutSectionConnectedPlatforms
  from "~/components/modules/project/components/overview/about-section/connected-platforms.vue";
// import LfxAssociatedOrganization from './about-section/associated-organization.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
