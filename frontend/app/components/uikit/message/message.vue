<template>
  <div
    v-if="isVisible"
    class="c-message"
    :class="[`c-message--${props.messageStyle}`, `c-message--${props.size}`, `c-message--${props.type}`]">
    <div class="c-message-header">
      <i class="c-message-icon" :class="messageIcon" />
      <span class="c-message-title">
        {{ props.message }}
      </span>
      <i v-if="props.type !== 'transparent'" class="c-message-close fa-light fa-xmark" @click="closeMessage" />
    </div>
    <div v-if="props.type !== 'transparent'" class="c-message-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageStyle, MessageSize, MessageType } from './types/message.types';

const isVisible = ref(true);

const props = withDefaults(
  defineProps<{
    message: string;
    messageStyle?: MessageStyle;
    size?: MessageSize;
    type?: MessageType;
    icon?: string;
  }>(),
  {
    messageStyle: 'default',
    size: 'default',
    type: 'box',
    icon: undefined
  }
);

const messageIcon = computed(() => {
  if (props.messageStyle === 'default' && props.icon) {
    return props.icon;
  }

  switch (props.messageStyle) {
    case 'info':
      return 'fa-solid fa-circle-info';
    case 'positive':
      return 'fa-solid fa-circle-check';
    case 'warning':
      return 'fa-solid fa-triangle-exclamation';
    case 'negative':
      return 'fa-solid fa-circle-exclamation';
    default:
      return 'fa-light fa-compass';
  }
});

const closeMessage = () => {
  isVisible.value = false;
};
</script>
<script lang="ts">
export default {
  name: 'LfxMessage'
};
</script>
