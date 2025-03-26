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

  <teleport to="body">
    <div
      v-show="isVisible"
      ref="popover"
      class="c-popover__content"
      :class="placement"
    >
      <slot
        name="content"
        :close="closePopover"
      />
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import {
  ref, watch, onMounted, onBeforeUnmount
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
}>(), {
  placement: 'bottom-start',
  triggerEvent: 'click',
  visibility: false,
  spacing: 4,
  disabled: false,
  matchWidth: false,
});

const emit = defineEmits<{(e: 'update:visibility', value: boolean): void }>();

const trigger = ref<HTMLElement | null>(null);
const popover = ref<HTMLElement | null>(null);
const popperInstance = ref<Instance | null>(null);
const isVisible = ref(props.visibility);

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
  document.addEventListener('click', handleClickOutside);
};

const closePopover = () => {
  isVisible.value = false;
  document.removeEventListener('click', handleClickOutside);
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

onMounted(() => {
  createPopperInstance();
  if (props.triggerEvent === 'hover') {
    trigger.value?.addEventListener('mouseenter', openPopover);
    trigger.value?.addEventListener('mouseleave', closePopover);
  }
});

onBeforeUnmount(() => {
  destroyPopperInstance();
  if (props.triggerEvent === 'hover') {
    trigger.value?.removeEventListener('mouseenter', openPopover);
    trigger.value?.removeEventListener('mouseleave', closePopover);
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
