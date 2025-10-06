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

    <article
      v-for="(member, index) of model.repository['core-team']"
      :key="index"
      class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4"
    >
      <div class="flex justify-between items-center min-h-7">
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
      </div>

      <div class="flex gap-4">
        <div class="flex-1 flex flex-col gap-4">
          <LfxField label="Name">
            <LfxInput v-model="member.name" />
          </LfxField>

          <LfxField label="Email">
            <LfxInput
              v-model="member.email"
              type="email"
            />
          </LfxField>
        </div>

        <div class="flex-1 flex flex-col gap-4">
          <LfxField label="Affiliation">
            <LfxInput
              v-model="member.affiliation"
              placeholder="Company or Organization"
            />
          </LfxField>

          <LfxField label="GitHub profile URL">
            <LfxInput
              v-model="member.social"
              placeholder="https://github.com/..."
            />
          </LfxField>
        </div>
      </div>

      <lfx-toggle
        v-model="member.primary"
      >
        Primary contact
      </lfx-toggle>
    </article>

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
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxToggle from "~/components/uikit/toggle/toggle.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";

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
