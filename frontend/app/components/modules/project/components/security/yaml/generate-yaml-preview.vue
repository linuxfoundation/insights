<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <h2 class="text-lg font-semibold mb-1 leading-7">
      YAML file preview
    </h2>
    <p class="text-body-2 leading-4 text-neutral-500">
      Review your generated YAML file before downloading. You can copy the content or download it as a file.
    </p>
    <pre
      lang="yaml"
      class="mt-6 p-4 bg-white border border-neutral-200 rounded-xl overflow-auto text-sm font-mono"
    >{{ props.data }}</pre>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  data: string
}>();
</script>

<script lang="ts">
export default {
name: 'LfSecurityGenerateYamlPreview',
}
</script>
