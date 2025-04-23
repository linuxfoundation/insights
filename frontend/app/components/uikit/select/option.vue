<template>
  <lfx-dropdown-item
    :label="props.label"
    :value="props.value"
  >
    <slot />
  </lfx-dropdown-item>
</template>

<script setup lang="ts">
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";

const props = defineProps<{
  value: string;
  label: string;
}>();

</script>

<script lang="ts">
export default {
  name: 'LfxOption'
};
</script>
