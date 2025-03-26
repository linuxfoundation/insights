<template>
  <lfx-popover
    ref="popover"
    v-model:visibility="isVisible"
    :placement="props.placement"
    v-bind="$attrs"
  >
    <slot name="trigger" />

    <template #content>
      <div
        class="c-dropdown"
        :style="{width: props.width}"
        @click="popover.closePopover()"
      >
        <slot />
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import type {Placement} from "@popperjs/core";
import {computed} from "vue";
import LfxPopover from "~/components/uikit/popover/popover.vue";

const props = withDefaults(defineProps<{
  placement?: Placement,
  width?: string;
  visibility?: boolean,
}>(), {
  placement: 'bottom-start',
  width: 'auto',
  visibility: false,
});

const emit = defineEmits<{(e:'update:visibility', value: boolean): void}>();

const isVisible = computed({
  get: () => props.visibility,
  set: (value: boolean) => emit('update:visibility', value),
})

const popover = ref<LfxPopover | null>(null);
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>
