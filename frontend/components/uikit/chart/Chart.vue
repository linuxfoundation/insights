<template>
  <div style="width: 100%; height: 500px">
    <VChart :option="option" />
  </div>
</template>

<script setup lang="ts">
import { time } from 'echarts';
import type { ChartData, ChartSeries } from './types/ChartTypes';
import { convertDateData, buildYAxis, buildSeries } from './helpers/chart-helpers';

const props = withDefaults(
  defineProps<{
    data: ChartData[];
    series: ChartSeries[];
  }>(),
  {
    data: () => [],
    series: () => []
  }
);

const option = computed<ECOption>(() => ({
  xAxis: {
    type: 'category',
    data: convertDateData(props.data) ?? [],
    axisTick: {
      alignWithLabel: true
    },
    axisLabel: {
      formatter: (value: string) => formatDate(value, '{MMM}\n{yy}'),
      interval: 0
    }
  },
  yAxis: buildYAxis(props.series),
  series: buildSeries(props.series, props.data),
  legend: {
    data: ['ISSUES_OPENED', 'ISSUES_CLOSED', 'CUMULATIVE_ISSUES'],
    orient: 'vertical',
    left: 'left'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        // TODO: find a way to type this, currently echarts
        // doesn't export the type LabelFormatterParams
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => formatDate(params.value, '{MMM} {yyyy}')
      }
    },
    // TODO: find a way to type this, currently echarts
    // doesn't export the type LabelFormatterParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (params: any) => `${formatDate(params[0].axisValue, '{MMM} {yyyy}')}<br>
        ${params[0].seriesName}: ${params[0].value} <br>
        ${params[1].seriesName}: ${params[1].value} <br>
        ${params[2].seriesName}: ${params[2].value} `
  }
}));

const formatDate = (value: string, format: string) => time.format(new Date(parseInt(value, 10)), format, false);
</script>

<script lang="ts">
export default {
  name: 'LfxChart'
};
</script>
