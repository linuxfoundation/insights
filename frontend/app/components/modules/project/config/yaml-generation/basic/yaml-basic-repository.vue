<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h3 class="text-lg leading-7 font-semibold text-slate-900">
        Repository details
      </h3>
      <p class="text-body-2 text-slate-500">
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
        <lfx-select
          v-model="model.repository.status"
          placeholder="Select status"
          class="w-60"
        >
          <lfx-option
            value="active"
            label="Active"
          />
          <lfx-option
            value="inactive"
            label="Inactive"
          />
          <lfx-option
            value="archived"
            label="Archived"
          />
        </lfx-select>
      </lfx-field>

      <div class="flex flex-col gap-4">
        <lfx-checkbox
          v-model="model.repository['accepts-change-request']"
          class="!items-start"
        >
          <p class="text-sm pl-1.5 -mt-0.5">
            Accepts change requests
          </p>
        </lfx-checkbox>
        <lfx-checkbox
          v-model="model.repository['accepts-automated-change-request']"
          class="!items-start"
        >
          <p class="text-sm pl-1.5 -mt-0.5">
            Accepts automated change requests
          </p>
        </lfx-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {url} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxSelect from '~/components/uikit/select/select.vue';
import LfxOption from '~/components/uikit/select/option.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';
import LfxFieldMessages from "~/components/uikit/field/field-messages.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})

const rules = {
  repository: {
    url: {
      url,
    }
  }
}

const $v = useVuelidate(rules, model);
</script>
