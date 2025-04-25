<template>
  <div
    class="c-benchmarks-icon"
    :class="`c-benchmarks-icon--${props.type}`"
  >
    <lfx-icon
      v-if="props.type === 'positive'"
      name="thumbs-up"
      type="solid"
      :size="props.size"
    />
    <lfx-icon
      v-else-if="props.type === 'warning'"
      :name="props.useTriangle ? 'triangle-exclamation' : 'exclamation-circle'"
      type="solid"
      :size="props.size"
    />
    <lfx-icon
      v-else-if="props.type === 'negative'"
      name="thumbs-down"
      type="solid"
      :size="props.size"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(defineProps<{
  type: string;
  useTriangle?: boolean;
  size?: number;
}>(), {
  useTriangle: false,
  size: 16
});
</script>
<script lang="ts">
export default {
  name: 'LfxBenchmarkIcon'
};
</script>
