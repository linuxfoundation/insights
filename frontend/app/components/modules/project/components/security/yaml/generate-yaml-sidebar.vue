<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-neutral-50 w-1/3 h-full relative border-r border-neutral-200">
    <div class="flex flex-col gap-6 p-6">
      <!-- Why generate a YAML file section -->
      <div>
        <h2 class="text-lg font-semibold text-neutral-900 leading-7 mb-6">
          Why generate a YAML file?
        </h2>

        <!-- Purpose -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-neutral-900 leading-5 mb-2">Purpose</h3>
          <p class="text-sm text-neutral-600 leading-5">
            YAML security file provides a standardised way to document, assess, and share a
            project's security practices, ensuring consistency and alignment with the specification
            across repositories.
            <a
              href="https://github.com/ossf/security-insights"
              rel="noopener noreferrer"
              target="_blank"
              class="text-brand-500"
            >
              Learn more
            </a>
          </p>
        </div>

        <!-- Requirements -->
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-sm font-semibold text-neutral-900 leading-5">Requirements</h3>
            <lfx-tag
              variation="warning"
              size="small"
              type="solid"
            >
              Admin access
            </lfx-tag>
          </div>
          <p class="text-sm text-neutral-600 leading-5">
            Repository owner or admin. You'll need write permissions to upload the generated file to
            your GitHub repository.
          </p>
        </div>

        <!-- Information collected -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-900 leading-5 mb-2">
            Information collected
          </h3>
          <ul class="text-sm text-neutral-600 leading-5 list-disc ml-5">
            <li>Project details</li>
            <li>Repository details</li>
            <li>Administrator contacts</li>
            <li>Core team members</li>
            <li>License information</li>
            <li>Vulnerability reporting</li>
            <li>Security self-assessment</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom info box -->
    <div class="absolute bottom-6 left-6 right-6">
      <div class="bg-brand-50 border border-brand-300 rounded-xl p-4">
        <h4 class="text-base font-semibold text-brand-700 leading-6 mb-2">
          Following file generation
        </h4>
        <p class="text-sm text-brand-700 leading-5">
          Add the YAML file as
          <code class="font-mono font-semibold">security.yaml</code>
          in your repository root and commit to enable security assessments.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LfxTag from '~/components/uikit/tag/tag.vue'
</script>

<script lang="ts">
export default {
  name: 'LfSecurityGenerateYamlSidebar',
}
</script>
