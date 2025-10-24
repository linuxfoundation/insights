<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">Project details</p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">Steward</p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Information about the individual responsible for overseeing the project, ensuring its proper
        management.
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <lfx-field label="URI">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          Project’s primary steward or maintainer identifier (URL or contact reference)
        </p>
        <lfx-input
          v-model="model.project.steward.uri"
          :invalid="$v.project.steward.uri.$invalid && $v.project.steward.uri.$dirty"
          @blur="$v.project.steward.uri.$touch()"
          @input="$v.project.steward.uri.$touch()"
        />
        <lfx-field-messages
          :validation="$v.project.steward.uri"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>

    <lfx-field label="Comment">
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Notes about the steward’s role or responsibilities
      </p>
      <lfx-textarea
        v-model="model.project.steward.comment"
        class="min-h-18"
      />
    </lfx-field>
  </div>
</template>

<script setup lang="ts">
import { url } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
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
  project: {
    steward: {
      uri: {
        url,
      },
    },
  },
};

const $v = useVuelidate(rules, model);
</script>
