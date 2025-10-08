<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">Repository details</p>
      <p class="text-lg font-semibold text-neutral-900">Security tools</p>
      <p class="text-body-2 text-neutral-500">
        Tools used to assess, monitor, or enforce security within the repository. This includes
        static analysis, dependency scanning, vulnerability detection, and other automated or manual
        security solutions.
      </p>
    </div>

    <!-- Security tool items -->
    <lfx-yaml-security-tool-item
      v-for="(tool, index) of (model as any).repository.security.tools"
      :key="index"
      v-model="(model as any).repository.security.tools[index]"
    >
      <p class="text-sm font-bold text-neutral-900">Security tool #{{ index + 1 }}</p>
      <lfx-icon-button
        v-if="(model as any).repository.security.tools.length > 1"
        type="default"
        icon="trash-can"
        size="small"
        @click="(model as any).repository.security.tools.splice(index, 1)"
      />
    </lfx-yaml-security-tool-item>

    <!-- Add security tool button -->
    <div class="flex items-center justify-center">
      <lfx-button
        type="transparent"
        button-style="pill"
        @click="addSecurityTool"
      >
        <lfx-icon name="plus" />
        Add security tool
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfxYamlSecurityToolItem from
  '~/components/modules/project/config/yaml-generation/shared/components/yaml-security-tool-item.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const addSecurityTool = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(model.value as any).repository.security.tools.push({
    name: '',
    type: '',
    version: '',
    rulesets: [''],
    results: {
      adhoc: {
        name: '',
        'predicate-uri': '',
        location: '',
        comment: '',
      },
      ci: {
        name: '',
        'predicate-uri': '',
        location: '',
        comment: '',
      },
      release: {
        name: '',
        'predicate-uri': '',
        location: '',
        comment: '',
      },
    },
    integration: {
      adhoc: false,
      ci: false,
      release: false,
    },
    comment: '',
  })
}
</script>

<script lang="ts">
export default {
  name: 'LfxYamlComprehensiveRepositorySecurityTools',
}
</script>
