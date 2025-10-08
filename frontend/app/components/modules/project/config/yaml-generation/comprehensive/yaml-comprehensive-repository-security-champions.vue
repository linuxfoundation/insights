<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">Repository details</p>
      <p class="text-lg font-semibold text-neutral-900">Security champions</p>
      <p class="text-body-2 text-neutral-500">
        Contributors or maintainers who take responsibility for promoting secure development
        practices, assisting with vulnerability triage, and serving as a point of contact for
        security-related matters in the repository.
      </p>
    </div>

    <lfx-yaml-security-champion-item
      v-for="(_, index) of model.repository.security.champions"
      :key="index"
      v-model="model.repository.security.champions[index]"
    >
      <p class="text-sm font-semibold text-neutral-900">Security champion #{{ index + 1 }}</p>
      <lfx-icon-button
        v-if="model.repository.security.champions.length > 1"
        type="default"
        icon="trash-can"
        size="small"
        @click="model.repository.security.champions.splice(index, 1)"
      />
    </lfx-yaml-security-champion-item>

    <!-- Add security champion button -->
    <div class="flex items-center justify-center">
      <lfx-button
        type="transparent"
        button-style="pill"
        @click="addChampion"
      >
        <lfx-icon name="plus" />
        Add security champion
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfxYamlSecurityChampionItem from '~/components/modules/project/config/yaml-generation/shared/components/yaml-security-champion-item.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const addChampion = () => {
  model.value.repository.security.champions.push({
    name: '',
    email: '',
    primary: false,
  })
}
</script>
