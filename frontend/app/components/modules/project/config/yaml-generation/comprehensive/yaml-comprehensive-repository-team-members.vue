<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <p class="text-sm font-semibold text-brand-600">
      Repository details
    </p>
    <h2 class="text-lg font-semibold text-slate-900">
      Core team members
    </h2>
    <p class="text-xs text-slate-500">
      Active contributors and maintainers of the project. These are the people responsible for
      the ongoing development and maintenance of the project.
    </p>
  </div>

  <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
    <p class="text-sm font-semibold text-slate-900">
      Team member #1
    </p>

    <div class="grid grid-cols-2 gap-4">
      <lfx-field label="Name">
        <lfx-input v-model="name" />
      </lfx-field>

      <lfx-field label="Affiliation">
        <lfx-input
          v-model="affiliation"
          placeholder="Company or Organization"
        />
      </lfx-field>

      <lfx-field label="Email">
        <lfx-input
          v-model="email"
          type="email"
        />
      </lfx-field>

      <lfx-field label="GitHub profile URL">
        <lfx-input
          v-model="githubUrl"
          placeholder="https://github.com/..."
        />
      </lfx-field>
    </div>

    <lfx-checkbox v-model="isPrimaryContact">
      Primary contact
    </lfx-checkbox>
  </div>
</template>

<script setup lang="ts">
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

const name = ref('');
const affiliation = ref('');
const email = ref('');
const githubUrl = ref('');
const isPrimaryContact = ref(false);
</script>
