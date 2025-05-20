<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <lfx-project-about-section-loading :is-loading="isProjectLoading">
      <lfx-project-about-software-value />
    </lfx-project-about-section-loading>
    <lfx-project-about-section-loading :is-loading="isProjectLoading">
      <lfx-tags-and-languages />
    </lfx-project-about-section-loading>
    <lfx-project-about-section-loading :is-loading="isProjectLoading">
      <lfx-links />
      <lfx-project-about-section-connected-platforms />
    </lfx-project-about-section-loading>
    <!-- <lfx-associated-organization /> -->
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import LfxProjectAboutSoftwareValue from './about-section/about-software-value.vue';
import LfxTagsAndLanguages from './about-section/tags-ang-languages.vue';
import LfxLinks from './about-section/links.vue';
import LfxProjectAboutSectionLoading from './about-section/about-section-loading.vue';
import LfxProjectAboutSectionConnectedPlatforms
  from "~/components/modules/project/components/overview/about-section/connected-platforms.vue";
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { isProjectLoading } = storeToRefs(useProjectStore());
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
