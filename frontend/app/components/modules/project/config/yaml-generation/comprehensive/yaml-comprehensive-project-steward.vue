<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Project details
      </p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">
        Steward
      </p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Lorem ipsum
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <lfx-field label="URI">
        <lfx-input
          v-model="uri"
          placeholder=" "
        />
      </lfx-field>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Lorem ipsum
      </p>
    </div>

    <lfx-field label="Comment">
      <lfx-textarea
        v-model="comment"
        placeholder="Lorem ipsum"
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

const uri = ref('');
const comment = ref('');
</script>
