<template>
  <VChart :option="props.config" />
</template>

<script setup lang="ts">
const props = defineProps<{
  config: ECOption;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxChart'
};
</script>
