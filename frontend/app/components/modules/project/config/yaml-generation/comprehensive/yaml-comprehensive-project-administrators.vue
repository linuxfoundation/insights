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
        People who have administrative access to the project.
      </p>
    </div>


    <!-- Administrator cards -->
    <article
      v-for="(admin, index) of model.project.administrators"
      :key="index"
      class="flex flex-col gap-4 border border-solid border-neutral-200 rounded-xl bg-white p-4"
    >
      <div class="flex justify-between items-center min-h-7">
        <p class="text-sm font-semibold leading-5 text-neutral-900">
          Administrator #{{ index + 1 }}
        </p>

        <lfx-icon-button
          v-if="model.project.administrators.length > 1"
          type="default"
          icon="trash-can"
          size="small"
          @click="model.project.administrators.splice(index, 1)"
        />
      </div>

      <div class="flex gap-4">
        <!-- Left column -->
        <div class="flex flex-col gap-4 flex-1">
          <lfx-field label="Name">
            <lfx-input
              v-model="admin.name"
              placeholder=""
            />
          </lfx-field>

          <lfx-field label="Email">
            <lfx-input
              v-model="admin.email"
              placeholder=""
              type="email"
            />
          </lfx-field>
        </div>

        <!-- Right column -->
        <div class="flex flex-col gap-4 flex-1">
          <lfx-field label="Affiliation">
            <lfx-input
              v-model="admin.affiliation"
              placeholder="Company or Organization"
            />
          </lfx-field>

          <lfx-field label="GitHub profile URL">
            <lfx-input
              v-model="admin.social"
              placeholder="https://github.com/..."
              type="url"
            />
          </lfx-field>
        </div>
      </div>

      <!-- Primary contact toggle -->
      <lfx-toggle v-model="admin.primary">
        Primary contact
      </lfx-toggle>
    </article>

    <!-- Add administrator button -->
    <div class="flex items-center justify-center">
      <lfx-button
        type="transparent"
        button-style="pill"
        @click="addAdministrator"
      >
        <lfx-icon name="plus" />
        Add administrator
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxField from "~/components/uikit/field/field.vue";
import LfxInput from "~/components/uikit/input/input.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxToggle from "~/components/uikit/toggle/toggle.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
});

const addAdministrator = () => {
  model.value.project.administrators.push({
    name: '',
    affiliation: '',
    email: '',
    social: '',
    primary: false,
  })
}
</script>
