<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600 leading-5">
        Repository details
      </p>
      <h3 class="text-lg font-semibold text-slate-900 leading-7">
        Core team members
      </h3>
      <p class="text-xs text-slate-500 leading-4">
        Active contributors and maintainers of the project. These are the people responsible for the ongoing
        development and maintenance of the project.
      </p>
    </div>

    <!-- Team Members List -->
    <div class="flex flex-col gap-4">
      <div
        v-for="(member, index) in teamMembers"
        :key="index"
        class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4"
      >
        <p class="text-sm font-semibold text-slate-900 leading-5">
          Team member #{{ index + 1 }}
        </p>

        <div class="flex gap-4">
          <!-- Left Column -->
          <div class="flex-1 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-900 leading-5">
                Name
              </label>
              <lfx-input
                v-model="member.name"
                placeholder=""
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-900 leading-5">
                Email
              </label>
              <lfx-input
                v-model="member.email"
                type="email"
                placeholder=""
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="flex-1 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-900 leading-5">
                Affiliation
              </label>
              <lfx-input
                v-model="member.affiliation"
                placeholder="Company or Organization"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-900 leading-5">
                GitHub profile URL
              </label>
              <lfx-input
                v-model="member.githubUrl"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        <!-- Toggle Switch -->
        <div class="flex items-center gap-1.5">
          <pv-input-switch
            v-model="member.isPrimaryContact"
            input-id="primary-contact"
          />
          <label
            for="primary-contact"
            class="text-sm text-slate-900 leading-5"
          >
            Primary contact
          </label>
        </div>
      </div>
    </div>

    <!-- Add Team Member Button -->
    <button
      type="button"
      class="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors
        self-start"
      @click="addTeamMember"
    >
      <lfx-icon
        name="plus"
        :size="16"
        class="text-accent-500"
      />
      <span class="text-sm font-semibold text-accent-500 leading-5">
        Add team member
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

interface TeamMember {
  name: string;
  email: string;
  affiliation: string;
  githubUrl: string;
  isPrimaryContact: boolean;
}

const teamMembers = ref<TeamMember[]>([
  {
    name: '',
    email: '',
    affiliation: '',
    githubUrl: '',
    isPrimaryContact: false,
  },
]);

const addTeamMember = () => {
  teamMembers.value.push({
    name: '',
    email: '',
    affiliation: '',
    githubUrl: '',
    isPrimaryContact: false,
  });
};
</script>

<script lang="ts">
export default {
  name: 'YamlChildRepositoryTeamMembers',
};
</script>