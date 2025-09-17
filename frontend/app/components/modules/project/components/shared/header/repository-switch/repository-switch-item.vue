<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-2 px-3 rounded-md transition hover:bg-neutral-50
          cursor-pointer flex items-center justify-between text-sm leading-5 gap-2"
  >
    <div class="w-full flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 flex-grow">
        <lfx-checkbox
          v-if="props.isMultiSelect"
          :model-value="props.selected"
        />
        <slot />
      </div>
    </div>
    <lfx-icon
      v-if="props.selected && !props.isMultiSelect"
      name="check"
      :size="16"
      class="text-brand-500"
    />
  </article>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxCheckbox from "~/components/uikit/checkbox/checkbox.vue";

const props = withDefaults(defineProps<{
  selected: boolean;
  isMultiSelect?: boolean;
}>(), {
  isMultiSelect: false
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRepositorySwitchItem'
};
</script>
