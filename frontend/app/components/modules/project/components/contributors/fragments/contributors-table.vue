<template>
  <div class="lfx-table">
    <div class="lfx-table-header">
      <div>Contributor</div>
      <div>{{ contributionColumnHeader }}</div>
    </div>

    <div v-for="(contributor, index) in props.contributors" :key="index" class="lfx-table-row">
      <div class="flex flex-row gap-3 items-center">
        <lfx-avatar :src="contributor.avatar" type="member" />
        <div>{{ contributor.name }}</div>
      </div>
      <div>
        {{ formatNumber(contributor.contributions) }}
        <span v-if="props.showPercentage"> ({{ contributor.percentage }}%) </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { metricsOptions } from '~/components/shared/types/metrics';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import type { Contributor } from '~/components/shared/types/contributors.types';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    metric: string;
    contributors: Contributor[];
    showPercentage?: boolean;
  }>(),
  {
    showPercentage: false
  }
);

const contributionColumnHeader = computed(() => {
  if (props.metric === 'all') {
    return 'Total Contributions';
  }
  return `Total ${metricsOptions.find((option) => option.value === props.metric)?.label}`;
});
</script>

<script lang="ts">
export default {
  name: 'LfxContributorsTable'
};
</script>
