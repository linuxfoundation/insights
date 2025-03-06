import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { DateTime } from 'luxon';
import { lfxProjectDateOptions } from '~/components/modules/project/config/date-options';
import type {
  Project,
  ProjectRepository
} from '~/components/modules/project/types/project';
import { getRepoNameFromUrl } from '~/components/modules/repository/utils/repository.helpers';

const calculateGranularity = (start: string | null, end: string | null): string => {
  // Return weekly if either date is null
  if (!start || !end) {
    return 'weekly';
  }

  const startDate = DateTime.fromISO(start);
  const endDate = DateTime.fromISO(end);
  const diffInDays = Math.ceil(endDate.diff(startDate, 'days').days);

  if (diffInDays <= 90) {
    return 'weekly';
  } if (diffInDays <= 365) {
    return 'monthly';
  } if (diffInDays <= 730) {
    return 'quarterly';
  }
    return 'yearly';
};

export const useProjectStore = defineStore('project', () => {
  const route = useRoute();

  const startDate = ref<string | null>(lfxProjectDateOptions[0]?.startDate || null);
  const endDate = ref<string | null>(lfxProjectDateOptions[0]?.endDate || null);
  const project = ref<Project | null>(null);
  const projectRepos = computed<ProjectRepository[]>(() => (project.value?.repositories || []).map((repo) => ({
      ...repo,
      name: getRepoNameFromUrl(repo.repo)
    })));
  const selectedRepository = computed<string>(
    () => projectRepos.value.find(
        (repo: ProjectRepository) => route.params.name === repo.name
      )?.repo || ''
  );
  const granularity = computed<string>(() => (startDate.value === null || endDate.value === null
      ? 'yearly'
      : calculateGranularity(startDate.value, endDate.value)));

  return {
    startDate,
    endDate,
    project,
    projectRepos,
    selectedRepository,
    granularity
  };
});
