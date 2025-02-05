<template>
  <pv-chip
    :class="`p-chip-${props.size} p-chip-${props.type}`"
    :removable="props.removable"
    remove-icon="fa-solid fa-circle-xmark">
    <lfx-avatar v-if="props.image" :type="props.avatarType" :src="props.image" size="xsmall" />
    <i v-else-if="props.icon" :class="`chip-icon ${props.icon}`" />
    {{ props.label }}
  </pv-chip>
</template>

<script setup lang="ts">
import type { AvatarType } from '../avatar/types/Avatar.types';
import LfxAvatar from '../avatar/avatar.vue';
import type { ChipSize, ChipType } from './types/chip.types';

const props = withDefaults(
  defineProps<{
    label: string;
    size: ChipSize;
    type: ChipType;
    image?: string;
    icon?: string;
    avatarType: AvatarType;
    removable?: boolean;
  }>(),
  {
    label: '',
    type: 'light',
    size: 'normal',
    avatarType: 'member',
    removable: false,
    image: undefined,
    icon: undefined
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxChip'
};
</script>
