<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1 pb-6">
    <p class="text-sm font-semibold text-brand-600">
      Project details
    </p>
    <p class="text-lg font-semibold text-neutral-900">
      Repositories
    </p>
    <p class="text-xs font-normal text-neutral-500">
      Details about your project repository and contribution policies.
    </p>
  </div>

  <div class="flex flex-col gap-4">
    <article
      v-for="(repository, index) of model.project.repositories"
      :key="index"
      class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4"
    >
      <div class="flex justify-between items-center min-h-7">
        <p class="text-sm font-semibold text-neutral-900">
          Repository #{{index + 1}}
        </p>

        <lfx-icon-button
          v-if="model.project.repositories.length > 1"
          type="default"
          icon="trash-can"
          size="small"
          @click="model.project.repositories.splice(index, 1)"
        />
      </div>
      <lfx-field label="Repository name">
        <lfx-input
          v-model="repository.name"
          placeholder=" "
        />
      </lfx-field>

      <lfx-field label="Repository URL">
        <lfx-input
          v-model="repository.url"
          placeholder="https://github.com/your-project/your-repository"
        />
      </lfx-field>

      <lfx-field label="Repository comment">
        <lfx-textarea
          v-model="repository.comment"
          placeholder="Brief description of the repository purpose and scope"
          class="min-h-18"
        />
      </lfx-field>
    </article>
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
import {computed} from "vue";
import LfxInput from '~/components/uikit/input/input.vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})

const addRepository = () => {
  model.value.project.repositories.push({
    name: '',
    url: '',
    comment: '',
  })
}
</script>
