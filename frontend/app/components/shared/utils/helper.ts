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
    const { hostname } = url;
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (!pathParts.length) {
      return repo.name;
    }

    // GitHub, GitLab and Git repos: always show owner/repo (last 2 path segments)
    if (hostname === 'github.com' || hostname === 'gitlab' || hostname === 'git.') {
      return pathParts.length >= 2 ? pathParts.slice(-2).join('/') : pathParts[0] || '';
    }

    // For all other platforms (Gerrit): show full path after domain
    return pathParts.join('/');
  } catch {
    return repo.name;
  }
};
