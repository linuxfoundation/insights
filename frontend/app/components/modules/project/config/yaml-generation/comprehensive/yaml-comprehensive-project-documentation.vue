<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">Project details</p>
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">Documentation</h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Project resources regarding set up, policies, and processes that support proper usage and
        contribution.
      </p>
    </div>

    <!-- Form Fields -->
    <lfx-field label="Quickstart guide URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Beginner-friendly setup or installation guide
      </p>
      <lfx-input
        v-model="model.project.documentation['quickstart-guide']"
        :invalid="
          $v.project.documentation['quickstart-guide'].$invalid &&
            $v.project.documentation['quickstart-guide'].$dirty
        "
        @blur="$v.project.documentation['quickstart-guide'].$touch()"
        @input="$v.project.documentation['quickstart-guide'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['quickstart-guide']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Detailed guide URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Full project documentation or reference manual
      </p>
      <lfx-input
        v-model="model.project.documentation['detailed-guide']"
        :invalid="
          $v.project.documentation['detailed-guide'].$invalid &&
            $v.project.documentation['detailed-guide'].$dirty
        "
        @blur="$v.project.documentation['detailed-guide'].$touch()"
        @input="$v.project.documentation['detailed-guide'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['detailed-guide']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Code of conduct URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Rules on behavior and community participation
      </p>
      <lfx-input
        v-model="model.project.documentation['code-of-conduct']"
        :invalid="
          $v.project.documentation['code-of-conduct'].$invalid &&
            $v.project.documentation['code-of-conduct'].$dirty
        "
        @blur="$v.project.documentation['code-of-conduct'].$touch()"
        @input="$v.project.documentation['code-of-conduct'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['code-of-conduct']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Release process URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Releases planning, approval, and publishing processes
      </p>
      <lfx-input
        v-model="model.project.documentation['release-process']"
        :invalid="
          $v.project.documentation['release-process'].$invalid &&
            $v.project.documentation['release-process'].$dirty
        "
        @blur="$v.project.documentation['release-process'].$touch()"
        @input="$v.project.documentation['release-process'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['release-process']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Support policy URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Project support guidelines and assistance
      </p>
      <lfx-input
        v-model="model.project.documentation['support-policy']"
        :invalid="
          $v.project.documentation['support-policy'].$invalid &&
            $v.project.documentation['support-policy'].$dirty
        "
        @blur="$v.project.documentation['support-policy'].$touch()"
        @input="$v.project.documentation['support-policy'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['support-policy']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Signature verification URL">
      <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
        Instructions for verifying signed releases or artifacts
      </p>
      <lfx-input
        v-model="model.project.documentation['signature-verification']"
        :invalid="
          $v.project.documentation['signature-verification'].$invalid &&
            $v.project.documentation['signature-verification'].$dirty
        "
        @blur="$v.project.documentation['signature-verification'].$touch()"
        @input="$v.project.documentation['signature-verification'].$touch()"
      />
      <lfx-field-messages
        :validation="$v.project.documentation['signature-verification']"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>
  </div>
</template>

<script setup lang="ts">
import { url } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import LfxField from '~/components/uikit/field/field.vue'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const rules = {
  project: {
    documentation: {
      'quickstart-guide': {
        url,
      },
      'detailed-guide': {
        url,
      },
      'code-of-conduct': {
        url,
      },
      'release-process': {
        url,
      },
      'support-policy': {
        url,
      },
      'signature-verification': {
        url,
      },
    },
  },
}

const $v = useVuelidate(rules, model)
</script>
