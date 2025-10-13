<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">Repository details</p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">License information</p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Specify the license under which your project is distributed. This information helps users
        understand how they can use, modify, and distribute your code.
      </p>
    </div>

    <!-- Form Fields -->
    <div class="flex flex-col gap-6">
      <!-- License URL Field -->
      <lfx-field label="License URL">
        <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
          URL to the full text of your project's license
        </p>
        <lfx-input
          v-model="model.repository.license.url"
          placeholder="https://opensource.org/licenses/MIT"
          :invalid="$v.repository.license.url.$invalid && $v.repository.license.url.$dirty"
          @blur="$v.repository.license.url.$touch()"
          @input="$v.repository.license.url.$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.license.url"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <!-- License Expression Field -->
      <lfx-field label="License expression">
        <p class="text-xs font-normal leading-4 text-neutral-500 mb-1">
          SPDX license identifier (e.g., MIT, Apache-2.0, GPL-3.0, BSD-3-Clause)
        </p>
        <lfx-input
          v-model="model.repository.license.expression"
          placeholder="MIT"
        />
      </lfx-field>

      <!-- Common License Examples Info Box -->
      <div class="flex flex-col gap-2">
        <div class="flex gap-1 items-center text-brand-600">
          <lfx-icon
            name="circle-info"
            :size="14"
          />
          <p class="text-xs font-semibold leading-4">Common license examples</p>
        </div>
        <div class="flex gap-4">
          <div class="flex flex-col gap-1 flex-1">
            <p class="text-xs leading-4 text-neutral-600">
              <span class="font-semibold">MIT:</span>
              <span class="font-normal"> Permissive license with minimal restrictions</span>
            </p>
            <p class="text-xs leading-4 text-neutral-600">
              <span class="font-semibold">Apache-2.0:</span>
              <span class="font-normal"> Permissive license with patent protection</span>
            </p>
            <p class="text-xs leading-4 text-neutral-600">
              <span class="font-semibold">GPL-3.0:</span>
              <span class="font-normal">
                Copyleft license requiring derivative works to be open source</span>
            </p>
            <p class="text-xs leading-4 text-neutral-600">
              <span class="font-semibold">BSD-3-Clause:</span>
              <span class="font-normal">
                Permissive license similar to MIT with additional clause</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { url } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import LfxField from '~/components/uikit/field/field.vue'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
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
  repository: {
    license: {
      url: {
        url,
      },
    },
  },
}

const $v = useVuelidate(rules, model)
</script>
