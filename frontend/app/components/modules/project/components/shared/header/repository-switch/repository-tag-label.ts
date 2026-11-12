// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface RepositoryFlags {
  isUnavailable: boolean;
  isArchived: boolean;
  isExcluded: boolean;
}

// A repository gone from its source is usually also marked excluded, so unavailable wins.
export const repositoryTagLabel = ({
  isUnavailable,
  isArchived,
  isExcluded,
}: RepositoryFlags): string | null => {
  if (isUnavailable) {
    return 'Unavailable';
  }
  if (isArchived) {
    return 'Archived';
  }
  return isExcluded ? 'Excluded' : null;
};
