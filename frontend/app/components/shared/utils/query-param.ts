// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  dateOptKeys,
  lfxProjectDateOptions,
  type DateOptionConfig,
} from '~/components/modules/project/config/date-options';
import {
  defaultDateOption,
  defaultTimeRangeKey,
} from '~/components/modules/project/store/project.store';

export type URLParams = {
  timeRange?: string;
  start?: string | null;
  end?: string | null;
  widget?: string;
};

const getStartAndEndDate = (rangeValue: string) => {
  const option = lfxProjectDateOptions.find(
    (option) => option.key === rangeValue
  ) as DateOptionConfig;

  if (option) {
    return {
      start: option.startDate,
      end: option.endDate,
    };
  }

  return {
    start: null,
    end: null,
  };
};
export const useQueryParam = () => {
  const route = useRoute();
  const router = useRouter();

  const queryParams = computed<URLParams>({
    get: () => {
      const {
 timeRange: paramTimeRange, start: paramStart, end: paramEnd, widget
} = route.query;

      // Parse and validate date params
      const isValidStartDate = DateTime.fromISO(paramStart as string).isValid;
      const isValidEndDate = DateTime.fromISO(paramEnd as string).isValid;

      // Get timeRange with fallback to default
      const timeRange = (paramTimeRange as string) || defaultTimeRangeKey;

      // Handle date params
      let start = null;
      let end = null;

      // Check if timeRange is a valid dateOptKeys enum value
      if (!Object.values(dateOptKeys).includes(timeRange as dateOptKeys)) {
        return {
          widget: widget as string,
        };
      }

      if (timeRange !== dateOptKeys.alltime) {
        // get the start and end date option from the time range
        const { start: startOption, end: endOption } = getStartAndEndDate(timeRange);

        start = isValidStartDate
          ? startOption
          : defaultDateOption?.startDate || lfxProjectDateOptions[1]?.startDate || null;

        end = isValidEndDate
          ? endOption
          : defaultDateOption?.endDate || lfxProjectDateOptions[1]?.endDate || null;
      } else {
        start = undefined;
        end = undefined;
      }

      return {
        timeRange,
        start,
        end,
        widget: widget as string,
      };
    },
    set: (value: URLParams) => {
      const query: URLParams = {
        ...(route.query as URLParams),
        ...value,
      };

      query.start = query.start || undefined;
      query.end = query.end || undefined;

      router.replace({ query });
    },
  });

  return {
    queryParams,
  };
};
