<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Merge lead time
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div v-if="status === 'success'" class="flex flex-row gap-4 items-center mb-6">
        <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
        <lfx-delta-display :summary="summary" icon="circle-arrow-up-right" icon-type="solid" unit="d" />
      </div>

      <div class="w-full h-[350px] mt-5 pb-6">
        <div v-if="status === 'success'">
          add lead time chart here
        </div>
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { MergeLeadTime } from './types/merge-lead-time.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Summary } from '~/components/shared/types/summary.types';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);

const { showToast } = useToastService();

const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/projects/development/merge-lead-time?project=${route.params.slug
    }&repository=${route.params.name || ''}&time-period=${props.timePeriod}`
);

const mergeLeadTime = computed<MergeLeadTime>(() => data.value as MergeLeadTime);

const summary = computed<Summary>(() => mergeLeadTime.value.summary);

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching merge lead time: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMergeLeadTime',
}
</script>
