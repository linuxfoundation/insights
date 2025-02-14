<template>
  <div class="flex justify-center items-center h-full w-full">
    <lfx-icon name="spinner-third" class="animate-spin font-normal" :size="props.size" />
  </div>
</template>

<script lang="ts" setup>
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = withDefaults(defineProps<{
  size?: number;
}>(), {
  size: 16
});
</script>

<script lang="ts">
export default {
  name: 'LfxSpinner'
};
</script>
