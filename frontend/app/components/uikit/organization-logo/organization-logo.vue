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
    <lfx-tooltip
      content="This project is part of The Linux Foundation"
      placement="top"
    >

      <span
        v-if="props.isLF"
        class="is-lf-icon"
      >
        <img
          src="~/assets/images/icon.svg"
          alt="LFX icon"
        >
      </span>
    </lfx-tooltip>
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
    isLF?: boolean;
  }>(),
  {
    size: 'normal',
    src: undefined,
    isLF: true
  }
);
</script>
