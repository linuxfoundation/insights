import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'nuxt/app';
import {
  dateOptKeys,
  lfxProjectDateOptions
} from '~/components/modules/project/config/date-options';
import type {Project, ProjectRepository} from "~~/types/project";
import { getRepoNameFromUrl } from '~/components/modules/repository/utils/repository.helpers';

export const useProjectStore = defineStore('project', () => {
  const route = useRoute();

  const selectedTimeRangeKey = ref<string>(
    lfxProjectDateOptions[0]?.key || dateOptKeys.past90days
  );
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

  return {
    selectedTimeRangeKey,
    startDate,
    endDate,
    project,
    projectRepos,
    selectedRepository
  };
});
