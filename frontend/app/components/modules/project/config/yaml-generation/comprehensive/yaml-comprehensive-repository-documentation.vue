<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">Repository details</p>
      <p class="text-lg font-semibold text-neutral-900">Documentation</p>
      <p class="text-body-2 text-neutral-500">
        Repository resources regarding set up, policies, and processes that support proper usage and contribution.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <lfx-field label="Contribution guide URL">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          How new contributors can participate, submit changes, or follow project workflows.
        </p>
        <lfx-input
          v-model="model.repository.documentation['contributing-guide']"
          :invalid="
            $v.repository.documentation['contributing-guide'].$invalid &&
            $v.repository.documentation['contributing-guide'].$dirty
          "
          @blur="$v.repository.documentation['contributing-guide'].$touch()"
          @input="$v.repository.documentation['contributing-guide'].$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.documentation['contributing-guide']"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <lfx-field label="Review policy URL">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          Rules or processes for reviewing contributions, such as code reviews, approvals, or quality checks.
        </p>
        <lfx-input
          v-model="model.repository.documentation['review-policy']"
          :invalid="
            $v.repository.documentation['review-policy'].$invalid && $v.repository.documentation['review-policy'].$dirty
          "
          @blur="$v.repository.documentation['review-policy'].$touch()"
          @input="$v.repository.documentation['review-policy'].$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.documentation['review-policy']"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <lfx-field label="Security policy URL">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          Security practices, disclosure process, and reporting guidelines.
        </p>
        <lfx-input
          v-model="model.repository.documentation['security-policy']"
          :invalid="
            $v.repository.documentation['security-policy'].$invalid &&
            $v.repository.documentation['security-policy'].$dirty
          "
          @blur="$v.repository.documentation['security-policy'].$touch()"
          @input="$v.repository.documentation['security-policy'].$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.documentation['security-policy']"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <lfx-field label="Governance URL">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          How decisions are made, who has authority in the project, and how leadership or roles are structured.
        </p>
        <lfx-input
          v-model="model.repository.documentation.governance"
          :invalid="$v.repository.documentation.governance.$invalid && $v.repository.documentation.governance.$dirty"
          @blur="$v.repository.documentation.governance.$touch()"
          @input="$v.repository.documentation.governance.$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.documentation.governance"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <lfx-field label="Dependency management policy URL">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          How external dependencies are tracked, updated, and audited for security or stability.
        </p>
        <lfx-input
          v-model="model.repository.documentation['dependency-management-policy']"
          :invalid="
            $v.repository.documentation['dependency-management-policy'].$invalid &&
            $v.repository.documentation['dependency-management-policy'].$dirty
          "
          @blur="$v.repository.documentation['dependency-management-policy'].$touch()"
          @input="$v.repository.documentation['dependency-management-policy'].$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.documentation['dependency-management-policy']"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { url } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue';

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
});

const rules = {
  repository: {
    documentation: {
      'contributing-guide': {
        url,
      },
      'review-policy': {
        url,
      },
      'security-policy': {
        url,
      },
      governance: {
        url,
      },
      'dependency-management-policy': {
        url,
      },
    },
  },
};

const $v = useVuelidate(rules, model);
</script>
