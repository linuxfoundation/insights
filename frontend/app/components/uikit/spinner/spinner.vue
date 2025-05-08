<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-center items-center h-full w-full">
    <lfx-icon
      name="spinner-third"
      class="animate-spin"
      :size="props.size"
      :type="props.type"
    />
  </div>
</template>

<script lang="ts" setup>
import LfxIcon from "~/components/uikit/icon/icon.vue";
import type { IconType } from "~/components/uikit/icon/types/icon.types";

const props = withDefaults(defineProps<{
  size?: number;
  type?: IconType;
}>(), {
  size: 16,
  type: 'regular'
});
</script>

<script lang="ts">
export default {
  name: 'LfxSpinner'
};
</script>
