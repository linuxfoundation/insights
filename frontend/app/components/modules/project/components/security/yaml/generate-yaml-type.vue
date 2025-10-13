<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="relative w-full">
    <h2 class="text-lg font-semibold text-slate-900 leading-7 mb-1">Choose YAML file template</h2>
    <p class="text-xs font-normal text-neutral-500 leading-4">
      Please select the YAML template file that better aligns with your project repository and
      security requirements.
    </p>

    <div class="pt-6 flex flex-wrap -mx-1.5 gap-y-3">
      <div
        v-for="(option, key) in yamlGenerationConfig"
        :key="key"
        class="w-1/3 px-1.5"
      >
        <div
          class="p-4 rounded-lg border border-neutral-200 h-full transition hover:bg-neutral-50 cursor-pointer"
          :class="model === key ? 'border-neutral-900 bg-neutral-100' : ''"
          @click="model = key"
        >
          <div class="flex justify-between pb-6">
            <lfx-icon
              :size="24"
              :name="option.icon || 'file'"
              class="text-neutral-400"
            />
            <lfx-icon
              v-if="model === key"
              name="check-circle"
              class="font-black"
              :size="16"
            />
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
              <h3 class="text-sm font-semibold text-neutral-900 leading-5">
                {{ option.label }}
              </h3>
              <p class="text-xs font-normal text-neutral-900 leading-4">
                {{ option.description }}
              </p>
            </div>
            <ul
              v-if="option.features"
              class="text-xs font-normal text-neutral-500 leading-4 list-disc pl-5"
            >
              <li
                v-for="(feature, index) in option.features"
                :key="index"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { yamlGenerationConfig } from '~/components/modules/project/config/yaml-generation/yaml-generation.config'
import LfxIcon from '~/components/uikit/icon/icon.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<script lang="ts">
export default {
  name: 'LfxSecurityGenerateYamlType',
}
</script>
