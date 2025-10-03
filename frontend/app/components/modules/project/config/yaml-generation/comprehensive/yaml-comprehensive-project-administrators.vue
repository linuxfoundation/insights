<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Project details
      </p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">
        Administrators
      </p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        People who have administrative access to the project. At least one administrator is required.
      </p>
    </div>

    <!-- Administrator Card -->
    <div class="relative">
      <!-- Add Administrator Button (positioned absolute) -->
      <button
        type="button"
        class="absolute left-1/2 -translate-x-1/2 bottom-[-18px] z-10 flex items-center justify-center gap-1.5 px-3
          py-1 text-sm font-semibold leading-5 text-brand-500 hover:text-brand-600 transition-colors"
        @click="addAdministrator"
      >
        <lfx-icon
          name="plus"
          class="text-base"
        />
        Add administrator
      </button>

      <!-- Card -->
      <div class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4 w-full max-w-[752px]">
        <p class="text-sm font-semibold leading-5 text-neutral-900">
          Administrator #1
        </p>

        <!-- Form Fields Grid -->
        <div class="flex gap-4">
          <!-- Left Column -->
          <div class="flex-1 flex flex-col gap-4">
            <lfx-field label="Name">
              <lfx-input
                v-model="administrator.name"
                placeholder=" "
              />
            </lfx-field>

            <lfx-field label="Email">
              <lfx-input
                v-model="administrator.email"
                type="email"
                placeholder=" "
              />
            </lfx-field>
          </div>

          <!-- Right Column -->
          <div class="flex-1 flex flex-col gap-4">
            <lfx-field label="Affiliation">
              <lfx-input
                v-model="administrator.affiliation"
                placeholder="Company or Organization"
              />
            </lfx-field>

            <lfx-field label="GitHub profile URL">
              <lfx-input
                v-model="administrator.githubUrl"
                placeholder="https://github.com/..."
              />
            </lfx-field>
          </div>
        </div>

        <!-- Toggle Switch -->
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            role="switch"
            :aria-checked="administrator.primaryContact"
            :class="[
              'relative inline-flex h-4 w-[30px] rounded-full p-0.5 transition-colors',
              administrator.primaryContact ? 'bg-brand-500' : 'bg-neutral-200'
            ]"
            @click="administrator.primaryContact = !administrator.primaryContact"
          >
            <span
              :class="[
                'inline-block h-3 w-3 rounded-full bg-white transition-transform',
                administrator.primaryContact ? 'translate-x-[14px]' : 'translate-x-0'
              ]"
            />
          </button>
          <span class="text-sm font-normal leading-5 text-neutral-900">
            Primary contact
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Administrator {
  name: string;
  email: string;
  affiliation: string;
  githubUrl: string;
  primaryContact: boolean;
}

const administrator = ref<Administrator>({
  name: '',
  email: '',
  affiliation: '',
  githubUrl: '',
  primaryContact: false
});

const addAdministrator = () => {
  // Add administrator logic
};
</script>
