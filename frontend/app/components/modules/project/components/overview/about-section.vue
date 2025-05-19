<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <template v-if="!isProjectLoading">
      <lfx-project-about-software-value />
      <lfx-tags-and-languages />
      <lfx-links />
    </template>
    <div
      v-else
      class="flex justify-center items-center h-[200px]"
    >
      <lfx-spinner
        :size="40"
        class="text-neutral-300"
        :type="'light'"
      />
    </div>
    <!-- <lfx-associated-organization /> -->
    <lfx-project-about-section-connected-platforms />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import LfxProjectAboutSoftwareValue from './about-section/about-software-value.vue';
import LfxTagsAndLanguages from './about-section/tags-ang-languages.vue';
import LfxLinks from './about-section/links.vue';
import LfxProjectAboutSectionConnectedPlatforms
  from "~/components/modules/project/components/overview/about-section/connected-platforms.vue";
// import LfxAssociatedOrganization from './about-section/associated-organization.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

const { isProjectLoading } = storeToRefs(useProjectStore());
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
