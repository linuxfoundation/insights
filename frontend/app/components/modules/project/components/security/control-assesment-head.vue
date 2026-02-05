<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-between items-start pb-4 sm:pb-5 flex-wrap gap-2">
    <div class="w-full md:w-3/4">
      <!-- Title -->
      <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
        <h1 class="text-heading-3 font-secondary font-bold">Controls assessment</h1>
        <!-- TODO: Enable when backend is ready -->
        <!--          <lfx-button-->
        <!--            type="tertiary"-->
        <!--            size="small"-->
        <!--            button-style="pill"-->
        <!--            class="whitespace-nowrap"-->
        <!--          >-->
        <!--            <lfx-icon name="arrows-rotate-reverse" />-->
        <!--            Update results-->
        <!--          </lfx-button>-->
      </div>

      <!-- Description -->
      <p class="text-xs text-neutral-500 pr-6 sm:pr-8">
        Process of assessing a project's practices, policies, and technical measures against a set of predefined
        standards to determine its security posture, reliability, and maturity.
        <a
          :href="links.securityScore"
          class="text-brand-500"
          target="_blank"
          rel="noopener noreferrer"
          >Learn more</a
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { links } from '~/config/links';
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityControlAssesmentHead',
};
</script>
