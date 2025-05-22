<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-dropdown__item"
    :class="{'is-selected': isSelected}"
    @click="handleClick"
  >
    <slot>
      {{props.label}}
    </slot>
    <div
      v-if="isSelected || props.checkmarkBefore"
      class="flex justify-end"
      :class="props.checkmarkBefore ? 'order-first min-w-4 w-4': 'flex-grow'"
    >
      <lfx-icon
        v-if="isSelected"
        name="check"
        :size="16"
        class="!text-brand-500"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  value?: string,
  label?: string,
  checkmarkBefore?: boolean,
}>();

const attrs = useAttrs()
// Inject provided value from DropdownSelect
const selectedValue = inject<ReturnType<typeof computed<string>>>('selectedValue', ref<string>(''));
const selectedOptionProps = inject('selectedOptionProps', ref(null));
//
// Determine if the item is currently selected
const isSelected = computed(() => selectedValue && props.value && selectedValue.value === props.value);

// Emit selection event upward
const handleClick = () => {
  if(!props.value){
    return
  }
  if(selectedOptionProps){
    selectedOptionProps.value = {
      ...props,
      ...attrs,
    };
  }
  if(selectedValue){
    selectedValue.value = props.value;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxDropdownItem'
};
</script>
