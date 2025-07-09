// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { DateTime } from 'luxon';
import {
  dateOptKeys,
  lfxProjectDateOptions,
} from '~/components/modules/project/config/date-options';
import type { Project, ProjectRepository } from '~~/types/project';
import { Granularity } from '~~/types/shared/granularity';
import { useQueryParam } from '~/components/shared/utils/query-param';
import {
  processProjectParams,
  projectParamsSetter
} from '~/components/modules/project/services/project.query.service';

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

export const useProjectStore = defineStore('project', () => {
  const route = useRoute();

  const { queryParams } = useQueryParam(processProjectParams, projectParamsSetter);
  const { timeRange, start, end, repos } = queryParams.value;

  const selectedTimeRangeKey = ref<string>(timeRange!);
  const startDate = ref<string | null>(start || null);
  const endDate = ref<string | null>(end || null);
  const isProjectLoading = ref(false);
  const project = ref<Project | null>(null);
  const projectRepos = computed<ProjectRepository[]>(() => project.value?.repositories || []);
  const selectedRepoSlugs = ref<string[]>(route.params.name ? [route.params.name as string] : repos?.split('|') || []);

  const selectedRepositories = computed<ProjectRepository[]>(() => projectRepos
    .value.filter((repo: ProjectRepository) => selectedRepoSlugs.value.includes(repo.slug) || 
      route.params.name === repo.slug));

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
    customRangeGranularity,
    selectedRepoSlugs,
    selectedRepositories
  };
});
