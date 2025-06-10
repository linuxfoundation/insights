<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <ul class="lfx-side-nav sticky top-[240px] flex flex-col gap-4">
    <li
      v-for="item in props.list"
      :key="item.label"
    >
      <a
        :href="`#${item.key}`"
        :class="{ active: activeItem === item.key }"
        @click="onClick(item.key, $event)"
      >{{
        item.label }}</a>
    </li>
  </ul>

  <lfx-button
    v-if="scrollTopPercentage > 25"
    class="fixed bottom-10"
    type="tertiary"
    button-style="pill"
    @click="onClick(props.list[0]?.key || '', $event)"
  >
    <lfx-icon name="arrow-up" />
    Back to top
  </lfx-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SideNavItem } from './types/side-nav.types';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useScroll from '~/components/shared/utils/scroll';
import { processTimeAndDateParams, timeAndDateParamsSetter, useQueryParam } from '~/components/shared/utils/query-param';

const props = defineProps<{
  list: SideNavItem[];
  modelValue: string;
}>();

const { scrollTopPercentage } = useScroll();
const { queryParams } = useQueryParam(processTimeAndDateParams, timeAndDateParamsSetter);

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const activeItem = computed<string>({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const onClick = (value: string, e: Event) => {
  activeItem.value = value;
  e.preventDefault();
  e.stopPropagation();

  queryParams.value = {
    widget: value,
  };
};
</script>

<script lang="ts">
export default {
  name: 'LfxSideNav'
};
</script>
