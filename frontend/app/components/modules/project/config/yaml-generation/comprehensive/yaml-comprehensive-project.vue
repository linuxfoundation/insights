<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Project details
      </h2>
      <p class="text-body-2 text-neutral-500">
        Basic project information...
      </p>
    </div>

    <!-- Project name -->
    <lfx-field label="Project name">
      <lfx-input
        v-model="formData.projectName"
        placeholder=""
      />
    </lfx-field>

    <!-- Project homepage -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Project homepage">
        <lfx-input
          v-model="formData.projectHomepage"
          placeholder=""
        />
      </lfx-field>
      <p class="text-body-2 text-neutral-500">
        Lorem ipsum
      </p>
    </div>

    <!-- Funding URL -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Funding URL">
        <lfx-input
          v-model="formData.fundingUrl"
          placeholder=""
        />
      </lfx-field>
      <p class="text-body-2 text-neutral-500">
        Lorem ipsum
      </p>
    </div>

    <!-- Roadmap URL -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Roadmap URL">
        <lfx-input
          v-model="formData.roadmapUrl"
          placeholder=""
        />
      </lfx-field>
      <p class="text-body-2 text-neutral-500">
        Lorem ipsum
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';

const formData = reactive({
  projectName: '',
  projectHomepage: '',
  fundingUrl: '',
  roadmapUrl: '',
});
</script>