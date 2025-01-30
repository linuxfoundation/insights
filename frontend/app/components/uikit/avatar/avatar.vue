<template>
  <pv-avatar :label="label" :image="props.src" :shape="props.shape" :size="props.size" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    size?: 'xlarge' | 'large' | 'normal';
    shape?: 'circle' | 'square';
    src?: string;
  }>(),
  {
    size: 'normal',
    shape: 'circle',
    src: undefined
  }
);

const label = computed(() => (props.src ? undefined : props.name.charAt(0)));
</script>

<script lang="ts">
export default {
  name: 'LfxAvatar'
};
</script>
