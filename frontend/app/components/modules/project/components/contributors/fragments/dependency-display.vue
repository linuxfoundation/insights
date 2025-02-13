<template>
  <div class="flex flex-row justify-between items-center mb-6">
    <div class="flex flex-row gap-4 items-center">
      <div>
        <slot />
      </div>
      <div class="flex flex-col items-start">
        <div class="text-sm font-semibold">{{ props.topDependency.count }} {{ props.label }}</div>
        <div :class="`text-body-1 text-${dependencyColor}-500`">
          {{ props.topDependency.percentage }}% of all contributions
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end">
      <div class="text-sm font-semibold">
        Other {{ props.otherDependency.count }} {{ props.label }}
      </div>
      <div class="text-body-1 text-neutral-500">
        {{ props.otherDependency.percentage }}% of all contributions
      </div>
    </div>
  </div>
  <lfx-progress-bar :value="props.topDependency.percentage" :color="dependencyColor" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { Dependency } from '~/components/shared/types/contributors.types';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';

const props = withDefaults(
  defineProps<{
    topDependency: Dependency;
    otherDependency: Dependency;
    label: string;
  }>(),
  {
    topDependency: { count: 0, percentage: 0 },
    otherDependency: { count: 0, percentage: 0 }
  }
);

const dependencyColor = ref<ProgressBarType>('warning');
</script>

<script lang="ts">
export default {
  name: 'LfxDependencyDisplay'
};
</script>
