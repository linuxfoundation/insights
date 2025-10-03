<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Project details header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Project details
      </h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Basic project information and administrator contacts.
      </p>
    </div>

    <!-- Project name field -->
    <lfx-field label="Project name">
      <lfx-input
        v-model="model.projectName"
        placeholder=""
      />
    </lfx-field>

    <!-- Administrators section -->
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold leading-6 text-neutral-900">
          Administrators
        </h3>
        <p class="text-xs font-normal leading-4 text-neutral-500">
          People who have administrative access to the project. At least one administrator is required.
        </p>
      </div>

      <!-- Administrator cards -->
      <div
        v-for="(admin, index) in model.administrators"
        :key="index"
        class="flex flex-col gap-4 border border-solid border-neutral-200 rounded-xl bg-white p-4"
      >
        <p class="text-sm font-semibold leading-5 text-neutral-900">
          Administrator #{{ index + 1 }}
        </p>

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
                v-model="admin.githubUrl"
                placeholder="https://github.com/..."
                type="url"
              />
            </lfx-field>
          </div>
        </div>

        <!-- Primary contact toggle -->
        <label class="flex gap-1.5 items-center cursor-pointer">
          <span class="relative inline-block w-[30px] h-4">
            <input
              v-model="admin.isPrimaryContact"
              type="checkbox"
              class="sr-only peer"
            >
            <span
              class="w-[30px] h-4 bg-neutral-200 rounded-full peer
                peer-checked:bg-brand-500 transition-colors duration-200
                flex items-center p-0.5"
              :class="admin.isPrimaryContact ? 'justify-end' : 'justify-start'"
            >
              <span class="w-3 h-3 bg-white rounded-full" />
            </span>
          </span>
          <span class="text-sm font-normal leading-5 text-neutral-900">
            Primary contact
          </span>
        </label>
      </div>

      <!-- Add administrator button -->
      <button
        type="button"
        class="flex gap-1.5 items-center justify-center px-3 py-1
          rounded-full text-brand-500 hover:bg-brand-50 transition-colors"
        @click="addAdministrator"
      >
        <lfx-icon
          name="plus"
          type="light"
          :size="16"
          class="text-brand-500"
        />
        <span class="text-sm font-semibold leading-5">
          Add administrator
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required, url, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import LfxInput from "~/components/uikit/input/input.vue";
import LfxField from "~/components/uikit/field/field.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";

interface Administrator {
  name: string;
  email: string;
  affiliation: string;
  githubUrl: string;
  isPrimaryContact: boolean;
}

interface ProjectDetails {
  projectName: string;
  administrators: Administrator[];
}

const props = defineProps<{
  modelValue: ProjectDetails;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: ProjectDetails): void }>();

const model = computed<ProjectDetails>({
  get: () => props.modelValue || { projectName: '', administrators: [createEmptyAdmin()] },
  set: (value: ProjectDetails) => emit('update:modelValue', value)
});

function createEmptyAdmin(): Administrator {
  return {
    name: '',
    email: '',
    affiliation: '',
    githubUrl: '',
    isPrimaryContact: false
  };
}

function addAdministrator() {
  model.value = {
    ...model.value,
    administrators: [...model.value.administrators, createEmptyAdmin()]
  };
}

const rules = {
  projectName: { required },
  administrators: {
    $each: {
      name: { required },
      email: { required, email },
      affiliation: {},
      githubUrl: { url },
      isPrimaryContact: {}
    }
  }
};

const _$v = useVuelidate(rules, model);
</script>
