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
      <!-- URL -->
      <lfx-field label="URL">
        <lfx-input
          v-model="model.uri"
          :invalid="$v.uri.$invalid && $v.uri.$dirty"
          @blur="$v.uri.$touch()"
          @input="$v.uri.$touch()"
        />
        <lfx-field-messages
          :validation="$v.uri"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

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
  uri: {
    url,
  },
}

const $v = useVuelidate(rules, model)
</script>

<script lang="ts">
export default {
  name: 'LfxYamlDistributionPointItem',
}
</script>
