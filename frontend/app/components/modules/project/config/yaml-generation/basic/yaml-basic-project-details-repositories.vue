<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <p class="text-sm font-semibold text-brand-600">
      Project details
    </p>
    <p class="text-lg font-semibold text-neutral-900">
      Repositories
    </p>
    <p class="text-xs font-normal text-neutral-500">
      Details about your project repository and contribution policies.
    </p>
  </div>

  <div class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4">
    <p class="text-sm font-semibold text-neutral-900">
      Repository #1
    </p>

    <lfx-field label="Repository name">
      <lfx-input
        v-model="repositoryName"
        placeholder=" "
      />
    </lfx-field>

    <lfx-field label="Repository URL">
      <lfx-input
        v-model="repositoryUrl"
        placeholder="https://github.com/your-project/your-repository"
      />
    </lfx-field>

    <lfx-field label="Repository comment">
      <lfx-textarea
        v-model="repositoryComment"
        placeholder="Brief description of the repository purpose and scope"
        class="h-[72px]"
      />
    </lfx-field>
  </div>


</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';

const repositoryName = ref('');
const repositoryUrl = ref('');
const repositoryComment = ref('');

</script>
