<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-full flex flex-col">
    <h2 class="text-lg font-semibold mb-1 leading-7">YAML file preview</h2>
    <p class="text-body-2 leading-4 text-neutral-500">
      Review your generated YAML file before downloading. You can copy the content or download it as
      a file.
    </p>

    <div class="mt-6 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3">
      <lfx-icon
        name="circle-info"
        type="solid"
        class="shrink-0 text-brand-600"
      />
      <p class="text-xs leading-4 text-brand-800">
        Add the YAML file as <span class="font-semibold font-mono">security.yaml</span> in your
        repository root and commit to enable security assessments.
      </p>
    </div>

    <pre
      lang="yaml"
      class="mt-6 p-4 bg-white border border-neutral-200 rounded-xl overflow-auto text-sm font-mono flex-grow"
    >{{ yaml }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getYaml } from '~/components/modules/project/services/js-yaml'
import LfxIcon from '~/components/uikit/icon/icon.vue'

const props = defineProps<{
  data: object
}>()

const yaml = computed(() => getYaml(props.data))
</script>

<script lang="ts">
export default {
  name: 'LfSecurityGenerateYamlPreview',
}
</script>
