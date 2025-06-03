// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { DateTime } from 'luxon';
import {
  dateOptKeys,
  lfxProjectDateOptions,
} from '~/components/modules/project/config/date-options';
import type { Project, ProjectRepository } from '~~/types/project';
import { Granularity } from '~~/types/shared/granularity';

const calculateGranularity = (start: string | null, end: string | null): string[] => {
  // Return weekly if either date is null
  if (!start || !end) {
    return [Granularity.WEEKLY];
  }

  const startDate = DateTime.fromISO(start);
  const endDate = DateTime.fromISO(end);
  const diffInDays = Math.ceil(endDate.diff(startDate, 'days').days);

  // TODO: verify with backend first if hourly granularity is doable
  switch (true) {
    case diffInDays <= 30:
      return [Granularity.DAILY];
    case diffInDays <= 90:
      return [Granularity.WEEKLY];
    case diffInDays <= 365:
      return [Granularity.WEEKLY, Granularity.MONTHLY];
    case diffInDays <= 730:
      return [Granularity.MONTHLY, Granularity.YEARLY];
    default:
      return [Granularity.YEARLY];
  }
};

export const defaultTimeRangeKey = dateOptKeys.past365days;
export const defaultDateOption = lfxProjectDateOptions.find(
  (option) => option.key === defaultTimeRangeKey
);

export const updateUrlParams = (timeRange: string, start: string | null, end: string | null) => {
  const route = useRoute();
  const router = useRouter();

  const query: Record<string, string | null | undefined> = {
    ...route.query,
    timeRange,
    start: start || undefined,
    end: end || undefined,
  };

  router.replace({ query });
};

export const getUrlDateParams = () => {
  const route = useRoute();
  const {
    timeRange: paramTimeRange,
    start: paramStart,
    end: paramEnd
} = route.query;
  const timeRange = paramTimeRange as string || defaultTimeRangeKey;
  let start = paramStart as string || defaultDateOption?.startDate || lfxProjectDateOptions[1]?.startDate || null;
  let end = paramEnd as string || defaultDateOption?.endDate || lfxProjectDateOptions[1]?.endDate || null;

  if(timeRange === dateOptKeys.alltime){
    start = null;
    end = null;
  }

  return {
    timeRange,
    start,
    end,
  };
};

export const useProjectStore = defineStore('project', () => {
  const route = useRoute();

  const { timeRange, start, end } = getUrlDateParams();
  const selectedTimeRangeKey = ref<string>(timeRange);
  const startDate = ref<string | null>(start);
  const endDate = ref<string | null>(end);
  const isProjectLoading = ref(false);
  const project = ref<Project | null>(null);
  const projectRepos = computed<ProjectRepository[]>(() => project.value?.repositories || []);

  const selectedRepository = computed<string>(
    () => projectRepos.value.find(
        (repo: ProjectRepository) => route.params.name === repo.slug
      )?.url || ''
  );
  const repository = computed<ProjectRepository | undefined>(() => projectRepos
    .value.find((repo: ProjectRepository) => route.params.name === repo.slug));

  const customRangeGranularity = computed<string[]>(() => (startDate.value === null || endDate.value === null
      ? [Granularity.WEEKLY]
      : calculateGranularity(startDate.value, endDate.value)));

  return {
    selectedTimeRangeKey,
    startDate,
    endDate,
    isProjectLoading,
    project,
    projectRepos,
    selectedRepository,
    repository,
    customRangeGranularity,
  };
});
