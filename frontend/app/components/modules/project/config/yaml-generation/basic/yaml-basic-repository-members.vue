<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">
        Repository details
      </p>
      <p class="text-heading-3 font-semibold text-neutral-900">
        Core team members
      </p>
      <p class="text-body-2 text-neutral-500">
        Active contributors and maintainers of the project. These are the people responsible
        for the ongoing development and maintenance of the project.
      </p>
    </div>

    <div
      class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4"
    >
      <p class="text-sm font-semibold text-neutral-900">
        Team member #1
      </p>

      <div class="flex gap-4">
        <div class="flex-1 flex flex-col gap-4">
          <LfxField label="Name">
            <LfxInput v-model="teamMember.name" />
          </LfxField>

          <LfxField label="Email">
            <LfxInput
              v-model="teamMember.email"
              type="email"
            />
          </LfxField>
        </div>

        <div class="flex-1 flex flex-col gap-4">
          <LfxField label="Affiliation">
            <LfxInput
              v-model="teamMember.affiliation"
              placeholder="Company or Organization"
            />
          </LfxField>

          <LfxField label="GitHub profile URL">
            <LfxInput
              v-model="teamMember.githubUrl"
              placeholder="https://github.com/..."
            />
          </LfxField>
        </div>
      </div>

      <LfxCheckbox
        v-model="teamMember.isPrimaryContact"
        label="Primary contact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

const teamMember = ref({
  name: '',
  email: '',
  affiliation: '',
  githubUrl: '',
  isPrimaryContact: false,
});
</script>
