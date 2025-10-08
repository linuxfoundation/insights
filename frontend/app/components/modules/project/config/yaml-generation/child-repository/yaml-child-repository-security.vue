<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">Repository details</p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">Security self-assessment</p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Provide additional context about your project's security posture and any self-assessment
        comments.
      </p>
    </div>

    <!-- Form Fields -->
    <div class="flex flex-col gap-6">
      <!-- Self-assessment Comment Field -->
      <lfx-field label="Self-assessment comment">
        <p class="text-xs font-normal leading-4 text-neutral-500 mb-2">
          Describe your project's security practices, any security reviews conducted, known
          limitation, or other relevant security information.
        </p>
        <lfx-textarea
          v-model="(model as any).repository.security.assessments.self.comment"
          class="min-h-27"
        />
      </lfx-field>

      <!-- Self-assessment Tips Info Box -->
      <div class="flex flex-col gap-2">
        <div class="flex gap-1 items-start text-brand-600">
          <lfx-icon
            name="lightbulb"
            type="light"
            :size="14"
            class="shrink-0"
          />
          <p class="text-xs font-semibold leading-4">Self-assessment tips</p>
        </div>
        <div class="flex gap-4">
          <ul class="text-xs leading-4 text-neutral-600 list-disc pl-[18px]">
            <li>Mention any security audits or penetration testing performed;</li>
            <li>Describe your secure coding practices and review processes;</li>
            <li>Note any security-focused dependencies or tools used;</li>
            <li>Be transparent about known security limitations;</li>
            <li>Include information about your incident response process.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LfxField from '~/components/uikit/field/field.vue'
import LfxTextarea from '~/components/uikit/textarea/textarea.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})
</script>
