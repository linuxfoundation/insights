<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="sticky top-[240px]">
    <ul class="lfx-side-nav flex flex-col gap-4">
      <li
        v-for="item in props.list"
        :key="item.label"
      >
        <a
          :href="`#${item.key}`"
          :class="{ active: activeItem === item.key }"
          @click="onClick(item.key, $event)"
          >{{ item.label }}</a
        >
      </li>
    </ul>

    <div
      v-if="name === WidgetArea.DEVELOPMENT"
      class="flex flex-col gap-2 p-3 bg-neutral-100 rounded-lg border border-neutral-200 mt-6 max-w-[190px]"
    >
      <lfx-icon
        name="info-circle"
        :size="14"
      />
      <span class="text-xs text-neutral-900 font-semibold">Bot activity is now included</span>
      <span class="text-xs text-neutral-600">
        We've updated the Development metrics to also count actions performed by bots. You may notice some changes in
        the numbers as a result.
        <a
          href="/docs/metrics/development"
          target="_blank"
          class="underline"
          >Learn more</a
        >
      </span>
    </div>
  </div>

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
import { useQueryParam } from '~/components/shared/utils/query-param';
import { processProjectParams, projectParamsSetter } from '~/components/modules/project/services/project.query.service';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';

const props = defineProps<{
  list: SideNavItem[];
  modelValue: string;
  name: WidgetArea;
}>();

const { scrollTopPercentage } = useScroll();
const { queryParams } = useQueryParam(processProjectParams, projectParamsSetter);

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const activeItem = computed<string>({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  },
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
  name: 'LfxSideNav',
};
</script>
