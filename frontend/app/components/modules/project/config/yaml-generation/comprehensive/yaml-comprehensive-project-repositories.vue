<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-center">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Project details
      </p>
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Repositories
      </h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Soluta perferendis laudantium temporibus neque consectetur ipsam delectus sit debitis corrupti soluta
        debitis quos.
      </p>
    </div>

    <!-- Repository Cards -->
    <div
      v-for="(repository, index) in repositories"
      :key="index"
      class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4 w-full"
    >
      <p class="text-sm font-semibold leading-5 text-neutral-900">
        Repository #{{ index + 1 }}
      </p>

      <lfx-field label="Repository name">
        <lfx-input
          v-model="repository.name"
          placeholder=""
        />
      </lfx-field>

      <lfx-field label="Repository URL">
        <lfx-input
          v-model="repository.url"
          placeholder="https://github.com/your-project/your-repository"
        />
      </lfx-field>

      <lfx-field label="Repository comment">
        <lfx-textarea
          v-model="repository.comment"
          placeholder="Brief description of the repository purpose and scope"
          class="h-18"
        />
      </lfx-field>
    </div>

    <!-- Add Repository Button -->
    <button
      type="button"
      class="flex items-center justify-center gap-1.5 px-3 py-1 h-9 rounded-full"
      @click="addRepository"
    >
      <lfx-icon
        name="plus"
        :size="20"
        class="text-[#009aff]"
      />
      <span class="text-sm font-semibold leading-5 text-[#009aff]">
        Add repository
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

interface Repository {
  name: string;
  url: string;
  comment: string;
}

const repositories = ref<Repository[]>([
  {
    name: '',
    url: '',
    comment: '',
  },
]);

const addRepository = () => {
  repositories.value.push({
    name: '',
    url: '',
    comment: '',
  });
};
</script>
