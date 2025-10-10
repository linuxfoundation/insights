<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="flex flex-col gap-4 border border-solid border-neutral-200 rounded-xl bg-white p-4"
  >
    <div class="flex justify-between items-center min-h-7">
      <slot />
    </div>

    <div class="flex flex-col gap-4">
      <!-- Left column -->
      <div class="flex gap-4">
        <lfx-field
          label="Name"
          class="flex-1"
        >
          <lfx-input
            v-model="model.name"
            placeholder=""
          />
        </lfx-field>

        <lfx-field
          label="Affiliation"
          class="flex-1"
        >
          <lfx-input
            v-model="model.affiliation"
            placeholder="Company or Organization"
          />
        </lfx-field>
      </div>

      <!-- Right column -->
      <div class="flex gap-4">
        <lfx-field
          label="Email"
          class="flex-1"
        >
          <lfx-input
            v-model="model.email"
            placeholder=""
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
        <lfx-field
          label="GitHub profile URL"
          class="flex-1"
        >
          <lfx-input
            v-model="model.social"
            placeholder="https://github.com/..."
            type="url"
            :invalid="$v.social.$invalid && $v.social.$dirty"
            @blur="$v.social.$touch()"
            @input="$v.social.$touch()"
          />
          <lfx-field-messages
            :validation="$v.social"
            :error-messages="{ url: 'Invalid URL' }"
          />
        </lfx-field>
      </div>
    </div>

    <!-- Primary contact toggle -->
    <lfx-toggle v-model="model.primary"> Primary contact </lfx-toggle>
  </article>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email, url } from '@vuelidate/validators'
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
  social: {
    url,
  },
}

const $v = useVuelidate(rules, model)
</script>

<script lang="ts">
export default {
  name: 'LfxYamlAdministratorItem',
}
</script>
