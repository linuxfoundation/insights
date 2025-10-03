<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <h3 class="text-lg font-semibold text-slate-900 leading-7">
        Repository details
      </h3>
      <p class="text-xs text-slate-500 leading-4">
        Details about your project repository and contribution policies.
      </p>
    </div>

    <!-- Form Fields -->
    <div class="flex flex-col gap-6">
      <!-- Repository URL -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-900 leading-5">
          Repository URL
        </label>
        <lfx-input
          v-model="repositoryUrl"
          placeholder="https://github.com/your-project/your-repository"
          class="w-full"
        />
      </div>

      <!-- Repository Status -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-900 leading-5">
          Repository status
        </label>
        <lfx-select
          v-model="repositoryStatus"
          placeholder="Select status"
          class="w-60"
        >
          <lfx-option
            value="active"
            label="Active"
          />
          <lfx-option
            value="inactive"
            label="Inactive"
          />
          <lfx-option
            value="archived"
            label="Archived"
          />
        </lfx-select>
      </div>

      <!-- Checkboxes -->
      <div class="flex flex-col gap-4">
        <lfx-checkbox v-model="acceptsChangeRequests">
          Accepts change requests
        </lfx-checkbox>
        <lfx-checkbox v-model="acceptsAutomatedChangeRequests">
          Accepts automated change requests
        </lfx-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxSelect from '~/components/uikit/select/select.vue';
import LfxOption from '~/components/uikit/select/option.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

const repositoryUrl = ref('');
const repositoryStatus = ref('active');
const acceptsChangeRequests = ref(false);
const acceptsAutomatedChangeRequests = ref(false);
</script>

<script lang="ts">
export default {
  name: 'YamlChildRepository',
};
</script>