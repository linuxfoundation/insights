<!-- NOTE: This filename and export name must be LfxButton.vue otherwise it causes a circular error with PrimeVue -->
<template>
  <pv-button :severity="props.type">
    <!-- TODO: Add loading icon -->
    <slot />
  </pv-button>
</template>

<script setup lang="ts">
import type {ButtonType} from "./types/ButtonType";

const props = withDefaults(defineProps<{
  type?: ButtonType,
  loading?: boolean,
}>(), {
    type: "primary"
});
</script>

<script lang="ts">
export default {
    name: "LfxButton"
};
</script>
