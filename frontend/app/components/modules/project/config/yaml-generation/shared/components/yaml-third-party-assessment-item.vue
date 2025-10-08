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
      <!-- Evidence URL and Date -->
      <div class="flex gap-4">
        <lfx-field
          label="Evidence URL"
          class="w-2/3"
        >
          <lfx-input
            v-model="model.evidence"
            :invalid="$v.evidence.$invalid && $v.evidence.$dirty"
            @blur="$v.evidence.$touch()"
            @input="$v.evidence.$touch()"
          />
          <lfx-field-messages
            :validation="$v.evidence"
            :error-messages="{ url: 'Invalid URL' }"
          />
        </lfx-field>

        <lfx-field
          label="Date"
          class="w-1/3"
        >
          <lfx-input
            v-model="model.date"
            placeholder="mm/dd/yyyy"
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
import { computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { url } from '@vuelidate/validators'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxField from '~/components/uikit/field/field.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'
import LfxTextarea from '~/components/uikit/textarea/textarea.vue'

interface ThirdPartyAssessment {
  evidence: string
  date: string
  comment: string
}

const props = defineProps<{
  modelValue: ThirdPartyAssessment
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: ThirdPartyAssessment): void }>()

const model = computed<ThirdPartyAssessment>({
  get: () => props.modelValue,
  set: (value: ThirdPartyAssessment) => emit('update:modelValue', value),
})

const rules = {
  evidence: {
    url,
  },
}

const $v = useVuelidate(rules, model)
</script>

<script lang="ts">
export default {
  name: 'LfxYamlThirdPartyAssessmentItem',
}
</script>
