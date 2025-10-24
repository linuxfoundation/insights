<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">Repository details</p>
      <p class="text-lg font-semibold leading-7 text-neutral-900">Security self-assessment</p>
      <p class="text-body-2 text-neutral-500">
        Provide additional context about your project's security posture and any self-assessment comments.
      </p>
    </div>

    <!-- Self-assessment Comment Field -->
    <div class="flex flex-col gap-2 mt-4">
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium leading-5 text-neutral-900">Self-assessment comment</p>
        <p class="text-body-2 text-neutral-500">
          Describe your project's security practices, any security reviews conducted, known limitation, or other
          relevant security information.
        </p>
      </div>

      <lfx-textarea
        v-model="model.repository.security.assessments.self.comment"
        placeholder=" "
        class="min-h-27"
      />
    </div>

    <!-- Self-assessment Tips -->
    <div class="flex flex-col gap-2 mt-4">
      <div class="flex gap-1 items-center text-brand-600">
        <lfx-icon
          name="lightbulb"
          type="light"
          :size="14"
        />
        <p class="text-xs font-semibold leading-4">Self-assessment tips</p>
      </div>

      <ul class="text-body-2 text-neutral-600 list-disc ml-[18px]">
        <li>Mention any security audits or penetration testing performed;</li>
        <li>Describe your secure coding practices and review processes;</li>
        <li>Note any security-focused dependencies or tools used;</li>
        <li>Be transparent about known security limitations;</li>
        <li>Include information about your incident response process.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
});
</script>
