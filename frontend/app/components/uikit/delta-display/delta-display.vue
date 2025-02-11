<template>
  <div class="flex flex-col gap-1">
    <!-- TODO: These colors seems different from what is defined in the design system
     Waiting for verification from Nuno -->
    <span :class="['text-delta-display flex items-center gap-2', deltaColor]">
      <lfx-icon :name="props.icon" :type="props.iconType" :size="12" />
      {{ percentage }}% ({{ delta }})
    </span>
    <span class="text-neutral-400 text-xs">vs. {{ formatNumber(props.previous) }} last period</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DeltaDisplayProps } from './types/delta-display.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = withDefaults(defineProps<DeltaDisplayProps>(), {
  isReverse: false,
  icon: '',
  iconType: 'light'
});

const percentage = computed(() => formatNumber(((props.current - props.previous) / props.previous) * 100, 1));

const delta = computed(() => {
  const value = props.current - props.previous;
  return value > 0 ? `+${value}` : value.toString();
});

const deltaColor = computed(() => (props.isReverse ? 'text-negative-500' : 'text-positive-500'));
</script>
