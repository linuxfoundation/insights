<template>
  <div
    class="c-organization-logo"
    :class="`c-org-logo-${props.size}`"
  >
    <lfx-avatar
      :src="props.src || ''"
      :size="size"
      type="organization"
    />
    <div
      v-if="props.isLf"
      class="is-lf-icon"
    >
      <lfx-tooltip
        content="This project is part of The Linux Foundation"
        placement="top"
      >
        <img
          src="~/assets/images/icon.svg"
          alt="LFX icon"
        >
      </lfx-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvatarSize } from '../avatar/types/Avatar.types';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const props = withDefaults(
  defineProps<{
    size?: AvatarSize;
    src?: string;
    isLf?: boolean;
  }>(),
  {
    size: 'normal',
    src: undefined,
    isLf: false
  }
);
</script>
