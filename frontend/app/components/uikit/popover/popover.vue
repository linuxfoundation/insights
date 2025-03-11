<template>
  <div class="c-popover">
    <div
      ref="trigger"
      class="c-popover__trigger"
      @click.stop="props.triggerEvent === 'click' ? togglePopover() : null"
      @mouseenter="props.triggerEvent === 'hover' ? showPopover() : null"
      @mouseleave="props.triggerEvent === 'hover' ? hidePopover() : null"
    >
      <slot :close="hidePopover" />
    </div>
    <Teleport
      v-if="!props.disabled && (props.persistent || isVisible)"
      to="body"
    >
      <div
        ref="popover"
        :style="popoverStyle"
        class="c-popover__content"
        :class="[`is-placed-${props.placement}`, { 'is-hidden': props.persistent && !isVisible }]"
      >
        <slot
          name="content"
          :close="hidePopover"
        />
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import {
  computed, onBeforeUnmount, ref, watch,
} from 'vue';
import type { PopoverPlacement } from '@/ui-kit/popover/types/PopoverPlacement';
import type { PopoverTrigger } from '@/ui-kit/popover/types/PopoverTrigger';
import useScroll from "~/components/shared/utils/scroll";

const props = withDefaults(defineProps<{
  placement?: PopoverPlacement,
  disabled?: boolean,
  spacing?: number,
  visibility?: boolean,
  triggerEvent?: PopoverTrigger,
  persistent?: boolean;
}>(), {
  placement: 'bottom-start',
  disabled: false,
  spacing: 4,
  visibility: false,
  triggerEvent: 'click',
  persistent: false,
});

const emit = defineEmits<{(e: 'update:visibility', value: boolean): void }>();

const {scrollTop} = useScroll();

const trigger = ref<any>(null);
const popover = ref<any>(null);
const isVisible = ref(props.visibility);

watch(() => props.visibility, (newValue) => {
  isVisible.value = newValue;
}, { immediate: true });

watch(isVisible, (newValue) => {
  emit('update:visibility', newValue);
});

const togglePopover = () => {
  isVisible.value = !isVisible.value;
  if (isVisible.value) addOutsideClickListener();
  else removeOutsideClickListener();
};

const showPopover = () => {
  isVisible.value = true;
  addOutsideClickListener();
};

const hidePopover = () => {
  isVisible.value = false;
  removeOutsideClickListener();
};

const handleClickOutside = (event: any) => {
  if (
    !trigger.value?.contains(event.target)
      && !popover.value?.contains(event.target)
  ) {
    isVisible.value = false;
    removeOutsideClickListener();
  }
};

const addOutsideClickListener = () => {
  document.addEventListener('click', handleClickOutside);
};

const removeOutsideClickListener = () => {
  document.removeEventListener('click', handleClickOutside);
};

const popoverStyle = computed(() => {
  if (!trigger.value || !popover.value) return {};

  const triggerRect = trigger.value.getBoundingClientRect();
  return {
    '--lfx-popover-trigger-top': `${(triggerRect.top + scrollTop.value) / 16}rem`,
    '--lfx-popover-trigger-left': `${triggerRect.left / 16}rem`,
    '--lfx-popover-trigger-right': `${triggerRect.right / 16}rem`,
    '--lfx-popover-trigger-bottom': `${triggerRect.bottom / 16}rem`,
    '--lfx-popover-trigger-width': `${trigger.value.offsetWidth / 16}rem`,
    '--lfx-popover-trigger-height': `${trigger.value.offsetHeight / 16}rem`,
    '--lfx-popover-content-width': `${popover.value.offsetWidth / 16}rem`,
    '--lfx-popover-content-height': `${popover.value.offsetHeight / 16}rem`,
    '--lfx-popover-spacing': `${props.spacing / 16}rem`,
  };
});

onBeforeUnmount(() => {
  removeOutsideClickListener();
});
</script>

<script lang="ts">
export default {
  name: 'LfxPopover',
};
</script>
