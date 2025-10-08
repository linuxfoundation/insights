<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4">
    <div class="flex justify-between items-center min-h-7">
      <slot />
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <lfx-field
          label="Name"
          class="flex-1"
        >
          <lfx-input v-model="model.name" />
        </lfx-field>

        <lfx-field
          label="Email"
          class="flex-1"
        >
          <lfx-input
            v-model="model.email"
            type="email"
            :invalid="$v.email.$invalid && $v.email.$dirty"
            @blur="$v.email.$touch()"
            @input="$v.email.$touch()"
          />
          <lfx-field-messages
            :validation="$v.email"
            :error-messages="{ email: 'Invalid email' }"
          />
        </lfx-field>
      </div>
    </div>

    <lfx-toggle v-model="model.primary"> Primary contact </lfx-toggle>
  </article>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email } from '@vuelidate/validators'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxField from '~/components/uikit/field/field.vue'
import LfxToggle from '~/components/uikit/toggle/toggle.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const rules = {
  email: {
    email,
  },
}

const $v = useVuelidate(rules, model)
</script>

<script lang="ts">
export default {
  name: 'LfxYamlSecurityChampionItem',
}
</script>
