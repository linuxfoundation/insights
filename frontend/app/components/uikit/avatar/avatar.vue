<template>
  <pv-avatar
    :icon="icon"
    :image="props.src"
    :shape="props.type === 'member' ? 'circle' : 'square'"
    :size="props.size"
    :class="{
      [`type-${props.type}`]: true,
      'p-avatar-sm': props.size === 'small',
      'p-avatar-xsmall': props.size === 'xsmall',
      'has-image': props.src
    }"
  />
</template>

<script setup lang="ts">
import type { AvatarSize, AvatarType } from './types/Avatar.types';
import { AvatarIcons } from './types/Avatar.types';

const props = withDefaults(
  defineProps<{
    type: AvatarType;
    size?: AvatarSize;
    src?: string;
  }>(),
  {
    size: 'normal',
    type: 'member',
    src: undefined
  }
);

const icon = computed(() => {
  if (props.src) {
    return undefined;
  }

  return props.type === 'member' ? AvatarIcons.Member : AvatarIcons.Organization;
});
</script>

<script lang="ts">
export default {
  name: 'LfxAvatar'
};
</script>
