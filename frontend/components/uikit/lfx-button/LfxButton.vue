<!-- NOTE: This filename and export name must be LfxButton.vue otherwise it causes a circular error with PrimeVue -->
<template>
  <Button :severity="props.type">
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { type ButtonType } from './types/ButtonType';

const props = withDefaults(defineProps<{
  type?: ButtonType,
}>(), {
  type: 'primary',
});
</script>

<script lang="ts">
export default {
  name: 'LfxButton',
};
</script>
