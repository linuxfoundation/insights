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
      <!-- Name -->
      <lfx-field label="Name">
        <lfx-input v-model="model.name" />
      </lfx-field>

      <!-- Predicate URL and Location URL -->
      <div class="flex gap-4">
        <lfx-field
          label="Predicate URL"
          class="flex-1"
        >
          <lfx-input
            v-model="model['predicate-uri']"
            :invalid="$v['predicate-uri'].$invalid && $v['predicate-uri'].$dirty"
            @blur="$v['predicate-uri'].$touch()"
            @input="$v['predicate-uri'].$touch()"
          />
          <lfx-field-messages
            :validation="$v['predicate-uri']"
            :error-messages="{ url: 'Invalid URL' }"
          />
        </lfx-field>

        <lfx-field
          label="Location URL"
          class="flex-1"
        >
          <lfx-input
            v-model="model.location"
            :invalid="$v.location.$invalid && $v.location.$dirty"
            @blur="$v.location.$touch()"
            @input="$v.location.$touch()"
          />
          <lfx-field-messages
            :validation="$v.location"
            :error-messages="{ url: 'Invalid URL' }"
          />
        </lfx-field>
      </div>

      <!-- Comment -->
      <lfx-field label="Comment">
        <lfx-textarea
          v-model="model.comment"
          rows="3"
        />
      </lfx-field>
    </div>
  </article>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { url } from '@vuelidate/validators'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxField from '~/components/uikit/field/field.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'
import LfxTextarea from '~/components/uikit/textarea/textarea.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const rules = {
  'predicate-uri': {
    url,
  },
  location: {
    url,
  },
}

const $v = useVuelidate(rules, model)
</script>

<script lang="ts">
export default {
  name: 'LfxYamlAttestationItem',
}
</script>
