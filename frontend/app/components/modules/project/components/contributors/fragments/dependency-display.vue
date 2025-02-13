<template>
  <div class="flex flex-row justify-between items-center mb-6">
    <div class="flex flex-row gap-4 items-center">
      <div>
        <slot />
      </div>
      <div class="flex flex-col items-start">
        <div class="text-sm font-semibold">{{ props.topContributors.count }} {{ label }}</div>
        <div :class="`text-body-1 text-${dependencyColor}-500`">
          {{ props.topContributors.percentage }}% of all contributions
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end">
      <div class="text-sm font-semibold">Other {{ props.otherContributors.count }} {{ label }}</div>
      <div class="text-body-1 text-neutral-500">
        {{ props.otherContributors.percentage }}% of all contributions
      </div>
    </div>
  </div>
  <lfx-progress-bar :value="props.topContributors.percentage" :color="dependencyColor" />
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { Dependency } from '~/components/shared/types/contributors.types';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
</script>
<script lang="ts">

const props = defineProps<{
  topContributors: Dependency;
  otherContributors: Dependency;
  label: string;
}>();

const dependencyColor = ref<ProgressBarType>('warning');

export default defineComponent({
  name: 'LfxDependencyDisplay'
});
</script>
