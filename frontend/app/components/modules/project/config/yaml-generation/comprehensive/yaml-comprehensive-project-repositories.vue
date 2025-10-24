<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1 pb-6">
    <p class="text-sm font-semibold text-brand-600">Project details</p>
    <p class="text-lg font-semibold text-neutral-900">Repositories</p>
    <p class="text-xs font-normal text-neutral-500">
      List all the project's related repositories to ensure that security policies, reporting
      processes, and documentation are applied consistently across the entire project.
    </p>
  </div>

  <div class="flex flex-col gap-4">
    <lfx-yaml-repository-item
      v-for="(_, index) of model.project.repositories"
      :key="index"
      v-model="model.project.repositories[index]"
    >
      <p class="text-sm font-semibold text-neutral-900">Repository #{{ index + 1 }}</p>

      <lfx-icon-button
        v-if="model.project.repositories.length > 1"
        type="default"
        icon="trash-can"
        size="small"
        @click="model.project.repositories.splice(index, 1)"
      />
    </lfx-yaml-repository-item>
  </div>

  <!-- Add repository button -->
  <div class="flex items-center justify-center pt-4">
    <lfx-button
      type="transparent"
      button-style="pill"
      @click="addRepository"
    >
      <lfx-icon name="plus" />
      Add repository
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxYamlRepositoryItem from '~/components/modules/project/config/yaml-generation/shared/components/yaml-repository-item.vue';

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
});

const addRepository = () => {
  model.value.project.repositories.push({
    name: '',
    url: '',
    comment: '',
  });
};

useVuelidate({}, model);
</script>
