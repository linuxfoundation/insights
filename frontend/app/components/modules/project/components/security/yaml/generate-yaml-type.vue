<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-select
      v-model="model"
      placeholder="Select a type"
      class="w-full"
    >
      <lfx-option
        v-for="(option, key) in yamlGenerationConfig"
        :key="key"
        :value="key"
        :label="option.label"
      >
        {{option.label}}
      </lfx-option>
    </lfx-select>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import LfxSelect from "~/components/uikit/select/select.vue";
import LfxOption from "~/components/uikit/select/option.vue";
import {yamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";

const props = defineProps<{
  modelValue: string
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>();

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<script lang="ts">
export default {
name: 'LfxSecurityGenerateYamlType',
}
</script>
