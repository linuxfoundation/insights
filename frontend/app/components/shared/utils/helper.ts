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
    const cleanUrl = repo.url.replace('q/', '').replace('project:', '');
    const url = new URL(cleanUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GitHub URLs: return last 2 segments (owner/repo)
    if (url.hostname === 'github.com') {
      return pathParts.slice(-2).join('/');
    }

    if (pathParts.length > 2) {
      return pathParts.slice(-2).join('/');
    }

    // Fallback: return repo name or last path segment
    return pathParts[pathParts.length - 1] || repo.name;
  } catch {
    // If URL parsing fails, return the repo name as fallback
    return repo.name;
  }
};
