<template>
  <lfx-popover
    ref="popover"
    v-model:visibility="isVisible"
    :placement="props.placement"
    v-bind="$attrs"
    :is-modal="pageWidth < 640"
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
import useResponsive from "~/components/shared/utils/responsive";

const props = withDefaults(defineProps<{
  placement?: Placement,
  width?: string;
  visibility?: boolean,
  matchWidth?: boolean,
}>(), {
  placement: 'bottom-start',
  width: 'auto',
  visibility: false,
  matchWidth: false,
});

const emit = defineEmits<{(e:'update:visibility', value: boolean): void}>();

const isVisible = computed({
  get: () => props.visibility,
  set: (value: boolean) => emit('update:visibility', value),
})

const popover = ref<LfxPopover | null>(null);

const {pageWidth} = useResponsive();
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>
