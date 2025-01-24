<template>
  <div style="width: 100%; height: 500px">
    <VChart :option="props.config" />
  </div>
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
