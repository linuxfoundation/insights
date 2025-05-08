// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {QueryFunction} from "@tanstack/vue-query";
import type {Pagination} from "~~/types/shared/pagination";
import type {Project} from "~~/types/project";

class ProjectApiService {
    fetchProjects(query: () => Record<string, string | number | boolean>): QueryFunction<Pagination<Project>> {
        return async ({ pageParam = 0 }) => await $fetch('/api/project', {
                params: {
                    page: pageParam,
                   ...query()
                },
            })
    }

    fetchProject(slug: string): QueryFunction<Project> {
        return () => $fetch(`/api/project/${slug}`);
    }
}

export const PROJECT_API_SERVICE = new ProjectApiService();
