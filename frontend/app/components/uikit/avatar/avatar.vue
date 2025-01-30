<template>
  <pv-avatar
    :label="label"
    :icon="props.icon"
    :image="props.src"
    :shape="props.shape"
    :size="props.size"
    :class="classes" />
</template>

<script setup lang="ts">
import type { AvatarSize, AvatarShape } from './types/Avatar.types';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    src?: string;
    icon?: string;
  }>(),
  {
    size: 'normal',
    shape: 'circle',
    src: undefined,
    icon: undefined
  }
);

const label = computed(() => (props.src || props.icon ? undefined : props.name.charAt(0)));
// PrimeVue Avatar component doesn't support small size
const classes = computed(() => {
  let cls = props.size === 'small' ? 'p-avatar-sm' : undefined;
  if (props.src) {
    cls = cls ? `${cls} has-image` : 'has-image';
  }
  return cls;
});
</script>

<script lang="ts">
export default {
  name: 'LfxAvatar'
};
</script>
