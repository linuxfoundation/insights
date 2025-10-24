// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { LocationQuery } from 'vue-router';
import {
  dateOptKeys,
  lfxProjectDateOptions,
  type DateOptionConfig,
} from '~/components/modules/project/config/date-options';
import {
  defaultDateOption,
  defaultTimeRangeKey,
} from '~/components/modules/project/store/project.store';
import type { URLParams } from '~/components/shared/utils/query-param';

const getStartAndEndDate = (rangeValue: string) => {
  const option = lfxProjectDateOptions.find(
    (option) => option.key === rangeValue,
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

const processDateParams = (query: LocationQuery): URLParams => {
  const { timeRange: paramTimeRange, start: paramStart, end: paramEnd } = query;
  // Get timeRange with fallback to default
  const timeRange = (paramTimeRange as string) || defaultTimeRangeKey;

  // Handle date params
  let start = null;
  let end = null;

  // Parse and validate date params
  const isValidStartDate = DateTime.fromISO(paramStart as string).isValid;
  const isValidEndDate = DateTime.fromISO(paramEnd as string).isValid;

  if (timeRange !== dateOptKeys.alltime) {
    // get the start and end date option from the time range
    const { start: startOption, end: endOption } = getStartAndEndDate(timeRange);

    if (timeRange === dateOptKeys.custom) {
      start = paramStart as string;
      end = paramEnd as string;
    } else {
      start = isValidStartDate
        ? startOption
        : defaultDateOption?.startDate || lfxProjectDateOptions[1]?.startDate || null;

      end = isValidEndDate
        ? endOption
        : defaultDateOption?.endDate || lfxProjectDateOptions[1]?.endDate || null;
    }
  } else {
    start = undefined;
    end = undefined;
  }

  return {
    timeRange,
    start,
    end,
  };
};

export const processProjectParams = (query: LocationQuery): URLParams => {
  const { timeRange: paramTimeRange, widget, repos } = query;

  // Check if timeRange is a valid dateOptKeys enum value
  if (!Object.values(dateOptKeys).includes(paramTimeRange as dateOptKeys)) {
    return {
      widget: widget as string,
      repos: repos as string,
    };
  }

  return { ...processDateParams(query), widget: widget as string, repos: repos as string };
};

export const projectParamsSetter = (query: URLParams) => {
  const tmpQuery = { ...query };

  tmpQuery.start = tmpQuery.start || undefined;
  tmpQuery.end = tmpQuery.end || undefined;

  return tmpQuery;
};
