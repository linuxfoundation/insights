<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">
        Repository details
      </p>
      <p class="text-heading-3 font-semibold text-neutral-900">
        Core team members
      </p>
      <p class="text-body-2 text-neutral-500">
        Active contributors and maintainers of the project. These are the people responsible
        for the ongoing development and maintenance of the project.
      </p>
    </div>

    <lfx-yaml-core-member-item
      v-for="(_, index) of model.repository['core-team']"
      :key="index"
      v-model="model.repository['core-team'][index]"
    >
      <p class="text-sm font-semibold text-neutral-900">
        Team member #{{index + 1}}
      </p>
      <lfx-icon-button
        v-if="model.repository['core-team'].length > 1"
        type="default"
        icon="trash-can"
        size="small"
        @click="model.repository['core-team'].splice(index, 1)"
      />
    </lfx-yaml-core-member-item>

    <!-- Add member button -->
    <div class="flex items-center justify-center">
      <lfx-button
        type="transparent"
        button-style="pill"
        @click="addMember"
      >
        <lfx-icon name="plus" />
        Add team member
      </lfx-button>
    </div>
  </div>

</template>

<script setup lang="ts">
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxYamlCoreMemberItem
  from "~/components/modules/project/config/yaml-generation/shared/components/yaml-core-member-item.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})


const addMember = () => {
  model.value.repository['core-team'].push({
    name: '',
    affiliation: '',
    email: '',
    social: '',
    primary: false,
  })
}
</script>
