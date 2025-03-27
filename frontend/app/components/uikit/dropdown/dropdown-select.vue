<template>
  <lfx-dropdown
    v-model:visibility="isVisible"
    :placement="props.placement"
    :width="props.width"
    :match-width="props.matchWidth"
    v-bind="$attrs"
  >
    <template #trigger>
      <slot
        name="trigger"
        :selected-option="selectedOption"
      />
    </template>

    <slot :selected-option="selectedOption" />
  </lfx-dropdown>
</template>

<script setup lang="ts">
import type {Placement} from "@popperjs/core";
import {computed, type VNode, provide} from "vue";
import {useSlots} from "vue";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";

const props = withDefaults(defineProps<{
  modelValue: string,
  placement?: Placement,
  width?: string,
  visibility?: boolean,
  matchWidth?: boolean,
}>(), {
  placement: 'bottom-start',
  width: 'auto',
  visibility: false,
  matchWidth: false,
});

const emit = defineEmits<{(e: 'update:modelValue', value: string): void;
  (e:'update:visibility', value: boolean): void
}>();

const slots = useSlots();

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

provide('selectedValue', value);

const isVisible = computed({
  get: () => props.visibility,
  set: (value: boolean) => emit('update:visibility', value),
})

// Recursive function to find components named 'LfxDropdownItem'
const findDropdownItems = (nodes: VNode[], result: VNode[] = []) => {
  nodes.forEach((node: VNode) => {
    if (!node) return
    if (node.type && node.type.name === 'LfxDropdownItem') {
      result.push(node)
    }
    if (node.children && Array.isArray(node.children)) {
      findDropdownItems(node.children as VNode[], result)
    } else if (typeof node.children === 'object' && node.children?.default) {
      findDropdownItems(node.children?.default?.() as VNode[], result)
    }
  })
  return result
}

const dropdownItems = computed<VNode[]>(() => {
  const slotNodes = slots.default ? slots.default() : []
  return findDropdownItems(slotNodes as VNode[]);
})

const selectedOption = computed(() => {
  const selected = dropdownItems.value.find((item) => item.props?.value === value.value)
  return selected?.props || { value: value.value, label: value.value }
})
</script>

<script lang="ts">
export default {
  name: 'LfxDropdownSelect'
};
</script>
