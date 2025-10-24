<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-slate-900">Repository details</h2>
      <p class="text-xs text-slate-500">
        Details about your project repository and contribution policies.
      </p>
    </div>

    <div class="flex flex-col gap-6">
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

      <lfx-field label="Repository status">
        <lfx-yaml-repository-status v-model="model.repository.status" />
      </lfx-field>

      <div class="flex flex-col gap-4">
        <lfx-checkbox
          v-model="model.repository['bug-fixes-only']"
          class="!items-start"
        >
          <span class="text-sm pl-1.5 -mt-0.5">Bug fixes only</span>
        </lfx-checkbox>
        <lfx-checkbox
          v-model="model.repository['accepts-change-request']"
          class="!items-start"
        >
          <span class="text-sm pl-1.5 -mt-0.5">Accepts change requests</span>
        </lfx-checkbox>
        <lfx-checkbox
          v-model="model.repository['accepts-automated-change-request']"
          class="!items-start"
        >
          <span class="text-sm pl-1.5 -mt-0.5">Accepts automated change requests</span>
        </lfx-checkbox>
        <lfx-checkbox
          v-model="model.repository['no-third-party-packages']"
          class="!items-start"
        >
          <span class="text-sm pl-1.5 -mt-0.5">No third-party packages</span>
        </lfx-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { url } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue';
import LfxYamlRepositoryStatus from '~/components/modules/project/config/yaml-generation/shared/components/yaml-repository-status.vue';

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
