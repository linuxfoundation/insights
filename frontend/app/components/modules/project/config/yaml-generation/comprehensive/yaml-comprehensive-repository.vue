<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-slate-900">
        Repository details
      </h2>
      <p class="text-xs text-slate-500">
        Details about your project repository and contribution policies.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <lfx-field label="Repository URL">
        <lfx-input
          v-model="model.repository.url"
          placeholder="https://github.com/your-project/your-repository"
        />
      </lfx-field>

      <lfx-field label="Repository status">
        <lfx-select
          v-model="model.repository.status"
          placeholder="Select status"
          class="!w-60"
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
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxSelect from '~/components/uikit/select/select.vue';
import LfxOption from '~/components/uikit/select/option.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})
</script>
