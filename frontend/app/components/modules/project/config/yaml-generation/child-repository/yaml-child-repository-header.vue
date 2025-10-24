<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">Header Information</h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Basic information about your project that will appear at the top of the YAML file.
      </p>
    </div>

    <!-- Form Fields -->
    <div class="flex flex-col gap-6">
      <!-- Project URL Field -->
      <lfx-field label="Project URL">
        <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
          The main URL where your project can be found (typically GitHub repository URL)
        </p>
        <lfx-input
          v-model="model.header.url"
          placeholder="https://github.com/your-org/your-project"
          :invalid="$v.header.url.$invalid && $v.header.url.$dirty"
          @blur="$v.header.url.$touch()"
          @input="$v.header.url.$touch()"
        />
        <lfx-field-messages
          :validation="$v.header.url"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <!-- Project Security Information source URL Field -->
      <lfx-field label="Project Security Information source URL">
        <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
          Repository where the YAML security file is hosted
        </p>
        <lfx-input
          v-model="model.header['project-si-source']"
          :invalid="
            $v.header['project-si-source'].$invalid && $v.header['project-si-source'].$dirty
          "
          @blur="$v.header['project-si-source'].$touch()"
          @input="$v.header['project-si-source'].$touch()"
        />
        <lfx-field-messages
          :validation="$v.header['project-si-source']"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  header: {
    url: {
      url,
    },
    'project-si-source': {
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
