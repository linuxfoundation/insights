<template>
  <div class="lfx-table">
    <div class="lfx-table-header">
      <div>Organization</div>
      <div>{{ organizationColumnHeader }}</div>
    </div>

    <div
      v-for="(organization, index) in props.organizations"
      :key="index"
      class="lfx-table-row"
    >
      <div class="flex flex-row gap-3 items-center">
        <lfx-avatar
          :src="organization.logo"
          type="organization"
        />
        <div>{{ organization.name }}</div>
      </div>
      <div>
        {{ formatNumber(organization.contributions) }}
        <span v-if="props.showPercentage"> - {{ organization.percentage }}% </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { metricsOptions } from '../config/metrics';
import type { Organization } from '../types/contributors.types';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    metric: string;
    organizations: Organization[];
    showPercentage?: boolean;
  }>(),
  {
    showPercentage: false
  }
);

const organizationColumnHeader = computed(() => {
  if (props.metric === 'all') {
    return 'Total contributions';
  }

  const flattenedMetricsOptions = metricsOptions.flatMap((option) => option.items);

  return `Total ${flattenedMetricsOptions.find((option) => option.value === props.metric)?.label.toLowerCase()}`;
});
</script>
<script lang="ts">
export default {
  name: 'LfxOrganizationsTable'
};
</script>
