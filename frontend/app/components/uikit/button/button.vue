<template>
  <pv-button :severity="props.type">
    <i v-if="props.loading" class="fa-sharp fa-light fa-spinner-third animate-spin" />
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
