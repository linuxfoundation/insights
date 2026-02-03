<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-4 sm:px-6 flex justify-between items-start pb-4 sm:pb-5 flex-wrap gap-2">
    <div class="w-full sm:w-1/2 md:w-1/2">
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
      <p class="text-xs text-neutral-500">
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

    <a
      href="https://revanite.io"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center px-2.5 py-1 border border-neutral-200 rounded-full"
    >
      <p class="text-neutral-500 text-xs mr-2">Powered by:</p>
      <img
        src="~/assets/images/revanite.svg"
        alt="Revanite.io Logo"
        class="h-5 w-5.5 mr-1.5"
      />
      <p class="text-neutral-900 text-xs">Revanite.io</p>
    </a>
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
