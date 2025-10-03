<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Repository details
      </p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">
        License information
      </p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Specify the license under which your project is distributed.
        This information helps users understand how they can use, modify, and distribute your code.
      </p>
    </div>

    <!-- License URL Field -->
    <div class="flex flex-col gap-2 mt-6">
      <lfx-field label="License URL">
        <lfx-input
          v-model="licenseUrl"
          placeholder="https://opensource.org/licenses/MIT"
        />
      </lfx-field>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        URL to the full text of your project's license
      </p>
    </div>

    <!-- License Expression Field -->
    <div class="flex flex-col gap-2 mt-4">
      <lfx-field label="License expression">
        <lfx-input
          v-model="licenseExpression"
          placeholder="MIT"
        />
      </lfx-field>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        SPDX license identifier (e.g., MIT, Apache-2.0, GPL-3.0, BSD-3-Clause)
      </p>
    </div>

    <!-- Common License Examples Info Box -->
    <div class="flex flex-col gap-2 mt-4">
      <div class="flex gap-1 items-center text-brand-500">
        <lfx-icon
          name="circle-info"
          :size="14"
        />
        <p class="text-xs font-semibold leading-4">
          Common license examples
        </p>
      </div>
      <div class="flex gap-4">
        <div class="flex flex-col gap-1 flex-1">
          <p class="text-xs leading-4 text-neutral-600">
            <span class="font-semibold">MIT:</span>
            <span class="font-normal"> Permissive license with minimal restrictions</span>
          </p>
          <p class="text-xs leading-4 text-neutral-600">
            <span class="font-semibold">Apache-2.0:</span>
            <span class="font-normal"> Permissive license with patent protection</span>
          </p>
          <p class="text-xs leading-4 text-neutral-600">
            <span class="font-semibold">GPL-3.0:</span>
            <span class="font-normal"> Copyleft license requiring derivative works to be open source</span>
          </p>
          <p class="text-xs leading-4 text-neutral-600">
            <span class="font-semibold">BSD-3-Clause:</span>
            <span class="font-normal"> Permissive license similar to MIT with additional clause</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const licenseUrl = ref('');
const licenseExpression = ref('');
</script>