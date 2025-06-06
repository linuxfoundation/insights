<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    ref="trigger"
    class="c-popover__trigger"
    :class="{'is-open': isVisible}"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </div>
  <ClientOnly>
    <teleport
      v-if="isVisible && !props.disabled"
      to="body"
    >
      <div
        ref="popover"
        class="c-popover__content"
        :class="{ 'is-modal': props.isModal }"
        @click="props.isModal ? closePopover() : null"
      >
        <slot
          name="content"
          :close="closePopover"
        />
      </div>
    </teleport>
  </ClientOnly>
</template>

<script lang="ts" setup>
import {
  ref, watch, onMounted, onBeforeUnmount, nextTick
} from 'vue';
import type {Instance, Placement} from '@popperjs/core';
import {createPopper} from '@popperjs/core';

const props = withDefaults(defineProps<{
  placement?: Placement,
  triggerEvent?: 'click' | 'hover',
  visibility?: boolean,
  spacing?: number,
  disabled?: boolean,
  matchWidth?: boolean,
  isModal?: boolean,
}>(), {
  placement: 'bottom-start',
  triggerEvent: 'click',
  visibility: false,
  spacing: 4,
  disabled: false,
  matchWidth: false,
  isModal: false,
});

const emit = defineEmits<{(e: 'update:visibility', value: boolean): void }>();

const trigger = ref<HTMLElement | null>(null);
const popover = ref<HTMLElement | null>(null);
const popperInstance = ref<Instance | null>(null);
const isVisible = ref(props.visibility);
const closeTimeout = ref<number | null>(null);

watch(() => props.visibility, (val) => {
  isVisible.value = val;
});
watch(isVisible, (val) => emit('update:visibility', val));

const createPopperInstance = () => {
  if (trigger.value && popover.value) {
    popperInstance.value = createPopper(trigger.value, popover.value, {
      strategy: 'fixed',
      placement: props.placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, props.spacing],
          },
        },
        ...(props.matchWidth ? [
          {
            name: "sameWidth",
            enabled: true,
            phase: "beforeWrite",
            requires: ["computeStyles"],
            fn: ({ state }) => {
              Object.assign(state.styles.popper, {
                width: `${state.rects.reference.width}px`,
              });
            },
          },
        ] : [])
      ],
    });
  }
};

const destroyPopperInstance = () => {
  popperInstance.value?.destroy();
  popperInstance.value = null;
};

const openPopover = async () => {
  isVisible.value = true;
  if (props.triggerEvent === 'click') {
    document.addEventListener('click', handleClickOutside);
  }
};

const closePopover = () => {
  isVisible.value = false;
  if (props.triggerEvent === 'click') {
    document.removeEventListener('click', handleClickOutside);
  }
};

const handleClick = (e: Event) => {
  e.stopPropagation();
  if (props.triggerEvent === 'click') {
    if (isVisible.value) {
      closePopover();
    } else {
      openPopover();
    }
  }
};

const handleClickOutside = (e: Event) => {
  if (
      popover.value
      && !popover.value.contains(e.target as Node)
      && !trigger.value?.contains(e.target as Node)
  ) {
    closePopover();
  }
};

const cancelClose = () => {
  if (closeTimeout.value !== null) {
    clearTimeout(closeTimeout.value);
    closeTimeout.value = null;
  }
};

const scheduleClose = () => {
  closeTimeout.value = window.setTimeout(() => {
    closePopover();
  }, 150);
};

onMounted(() => {
  if(import.meta.client) {
    createPopperInstance();
    if (props.triggerEvent === 'hover') {
      trigger.value?.addEventListener('mouseenter', openPopover);
      trigger.value?.addEventListener('mouseleave', scheduleClose);
      popover.value?.addEventListener('mouseenter', cancelClose);
      popover.value?.addEventListener('mouseleave', scheduleClose);
    }
  }
});

watch(isVisible, async (visible) => {
  if (visible) {
    await nextTick();
    createPopperInstance();

    if (props.triggerEvent === 'hover') {
      // Safely add listeners now that popover is in DOM
      popover.value?.addEventListener('mouseenter', cancelClose);
      popover.value?.addEventListener('mouseleave', scheduleClose);
    }
  } else {
    destroyPopperInstance();

    if (props.triggerEvent === 'hover') {
      // Clean up listeners when hiding
      popover.value?.removeEventListener('mouseenter', cancelClose);
      popover.value?.removeEventListener('mouseleave', scheduleClose);
    }
  }
});

onBeforeUnmount(() => {
  destroyPopperInstance();
  if (props.triggerEvent === 'hover') {
    trigger.value?.removeEventListener('mouseenter', openPopover);
    trigger.value?.removeEventListener('mouseleave', scheduleClose);
    popover.value?.removeEventListener('mouseenter', cancelClose);
    popover.value?.removeEventListener('mouseleave', scheduleClose);
  }

  if (closeTimeout.value !== null) {
    clearTimeout(closeTimeout.value);
  }
});

defineExpose({
  closePopover,
  openPopover,
})
</script>

<script lang="ts">
export default {
  name: 'LfxPopover',
};
</script>
