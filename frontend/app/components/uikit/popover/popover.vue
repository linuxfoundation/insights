<template>
  <pv-popover
    v-bind="$attrs" ref="popover"
    @show="emit('update:isOpen', true)"
    @hide="emit('update:isOpen', false)">
    <slot />
  </pv-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{(e: 'update:isOpen', value: boolean): void}>();

const popover = ref();

const show = (event: MouseEvent) => {
  popover.value.show(event);
};

const hide = (event: MouseEvent) => {
  popover.value.hide(event);
};

const toggle = (event: MouseEvent) => {
  popover.value.toggle(event);
};

defineExpose({
  show,
  hide,
  toggle,
});
</script>

<script lang="ts">
export default {
    name: "LfxPopover"
};
</script>
