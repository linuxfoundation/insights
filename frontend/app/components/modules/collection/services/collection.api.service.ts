// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { SearchProject, SearchResults } from '~~/types/search';

class CollectionApiService {
  async searchProjects(query: string): Promise<SearchProject[]> {
    if (!query || query.length === 0) {
      return [];
    }

    try {
      const res = await $fetch<SearchResults>('/api/search', {
        query: { query },
      });

      return res.projects || [];
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }
}

export const COLLECTION_API_SERVICE = new CollectionApiService();
