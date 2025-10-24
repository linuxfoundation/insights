<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">Repository details</h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Details about your project repository and contribution policies.
      </p>
    </div>

    <!-- Repository URL Field -->
    <lfx-field label="Repository URL">
      <lfx-input
        v-model="model.repository.url"
        placeholder="https://github.com/your-project/your-repository"
        :invalid="$v.repository.url.$invalid && $v.repository.url.$dirty"
        @blur="$v.repository.url.$touch()"
        @input="$v.repository.url.$touch()"
      />
      <lfx-field-messages
        :validation="$v.repository.url"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <!-- Repository Status Field -->
    <lfx-field label="Repository status">
      <lfx-yaml-repository-status v-model="model.repository.status" />
    </lfx-field>

    <!-- Checkboxes Section -->
    <div class="flex flex-col gap-4">
      <lfx-checkbox
        v-model="model.repository['accepts-change-request']"
        class="!items-start"
      >
        <p class="text-sm pl-1.5 -mt-1 pt-px">Accepts change requests</p>
      </lfx-checkbox>
      <lfx-checkbox
        v-model="model.repository['accepts-automated-change-request']"
        class="!items-start"
      >
        <p class="text-sm pl-1.5 -mt-1 pt-px">Accepts automated change requests</p>
      </lfx-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { url } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';
import LfxYamlRepositoryStatus from '~/components/modules/project/config/yaml-generation/shared/components/yaml-repository-status.vue';
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
    url: {
      url,
    },
  },
};

const $v = useVuelidate(rules, model);
</script>

<script lang="ts">
export default {
  name: 'YamlChildRepositoryHeader',
};
</script>
