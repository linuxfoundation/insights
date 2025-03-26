<template>
  <div
    class="c-dropdown__selector"
    :class="[
      `c-dropdown__selector--${props.size}`,
      `c-dropdown__selector--${props.type}`,
    ]"
  >
    <slot />
    <div class="flex justify-end flex-grow">
      <slot name="append">
        <lfx-icon
          name="angle-down"
          :size="12"
          class="text-neutral-500"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = withDefaults(defineProps<{
  size?: 'medium' | 'small';
  type?: 'transparent' | 'filled';
}>(), {
  size: 'medium',
  type: 'transparent',
});
</script>

<script lang="ts">
export default {
  name: 'LfxDropdownSelector',
};
</script>
