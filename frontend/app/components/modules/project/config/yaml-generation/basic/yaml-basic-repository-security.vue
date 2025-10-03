<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <p class="text-sm font-semibold text-brand-600">
      Repository details
    </p>
    <h2 class="text-heading-3 font-semibold text-neutral-900">
      Security self-assessment
    </h2>
    <p class="text-body-2 text-neutral-500">
      Provide additional context about your project's security posture and any self-assessment comments.
    </p>
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-neutral-900">
        Self-assessment comment
      </p>
      <p class="text-body-2 text-neutral-500">
        Describe your project's security practices, any security reviews conducted,
        known limitation, or other relevant security information.
      </p>
    </div>
    <lfx-textarea
      v-model="selfAssessmentComment"
      class="h-[108px]"
    />
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex items-start gap-1 text-[#0082d9]">
      <lfx-icon
        name="lightbulb"
        type="light"
        :size="14"
        class="shrink-0"
      />
      <p class="text-body-2 font-semibold whitespace-nowrap">
        Self-assessment tips
      </p>
    </div>
    <div class="flex gap-4">
      <ul class="text-body-2 text-neutral-600 list-disc pl-[18px]">
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
import { ref } from 'vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const selfAssessmentComment = ref('');
</script>
