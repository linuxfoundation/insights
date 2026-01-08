// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { isArray } from 'lodash-es';
import type { ProjectRepository } from '~~/types/project';
export const isEmptyData = (value: Record<string, unknown>[] | null | undefined) => {
  // check if the value is null or undefined or the length of the value is 0
  if (value === null || value === undefined || value.length === 0 || !isArray(value)) {
    return true;
  }

  // Check if all values in the chart data are 0
  return value.every((dataPoint) => {
    const values = dataPoint.values as number[];
    if (!values) {
      return false;
    }
    return (values[0] || 0) === 0 && (values[1] || 0) === 0;
  });
};

export const isElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= windowHeight;
};

export const normalizeRepoName = (repo: ProjectRepository): string => {
  try {
    const url = new URL(repo.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GitHub URLs: return last 2 segments (owner/repo)
    if (url.hostname === 'github.com') {
      return pathParts.slice(-2).join('/');
    }

    // Check for "project:" keyword in the path (e.g., gerrit URLs)
    const projectKeywordPart = pathParts.find((part) => part.startsWith('project:'));
    if (projectKeywordPart) {
      // Extract everything after "project:" (e.g., "project:aaf/cadi" -> "aaf/cadi")
      return projectKeywordPart.replace('project:', '');
    }

    // Fallback: return repo name or last path segment
    return pathParts[pathParts.length - 1] || repo.name;
  } catch {
    // If URL parsing fails, return the repo name as fallback
    return repo.name;
  }
};
