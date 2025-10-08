<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Project details header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">Project details</h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Basic project information and administrator contacts.
      </p>
    </div>

    <!-- Project name field -->
    <lfx-field label="Project name">
      <lfx-input
        v-model="model.project.name"
        placeholder=""
      />
    </lfx-field>

    <!-- Administrators section -->
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold leading-6 text-neutral-900">Administrators</h3>
        <p class="text-xs font-normal leading-4 text-neutral-500">
          People who have administrative access to the project. At least one administrator is
          required.
        </p>
      </div>

      <!-- Administrator cards -->
      <lfx-yaml-administrator-item
        v-for="(_, index) of model.project.administrators"
        :key="index"
        v-model="model.project.administrators[index]"
      >
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
      </lfx-yaml-administrator-item>

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
  </div>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxField from '~/components/uikit/field/field.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfxYamlAdministratorItem from '~/components/modules/project/config/yaml-generation/shared/components/yaml-administrator-item.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const addAdministrator = () => {
  model.value.project.administrators.push({
    name: '',
    affiliation: '',
    email: '',
    social: '',
    primary: false,
  })
}

const rules = {}

useVuelidate(rules, model)
</script>
