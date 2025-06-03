// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  dateOptKeys,
  lfxProjectDateOptions,
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

export const useQueryParam = () => {
  const route = useRoute();
  const router = useRouter();

  const queryParams = computed<URLParams>({
    get: () => {
      const {
 timeRange: paramTimeRange, start: paramStart, end: paramEnd, widget
} = route.query;
      const timeRange = (paramTimeRange as string) || defaultTimeRangeKey;
      let start = (paramStart as string)
        || defaultDateOption?.startDate
        || lfxProjectDateOptions[1]?.startDate
        || null;
      let end = (paramEnd as string)
        || defaultDateOption?.endDate
        || lfxProjectDateOptions[1]?.endDate
        || null;

      if (timeRange === dateOptKeys.alltime) {
        start = null;
        end = null;
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
