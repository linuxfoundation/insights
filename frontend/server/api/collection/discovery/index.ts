// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import {
  getCollectionDiscoveryMock,
  type CollectionDiscoveryResponse,
} from '~~/server/mocks/collection-discovery.mock';
import type { Collection } from '~~/types/collection';
import { useRuntimeConfig } from '#imports';

/**
 * Mock API endpoint for the collection discovery page.
 * Returns curated (real data), community, user's collections, and liked collections.
 *
 * Curated collections are fetched from the real API, while community, my, and liked
 * collections are mocked for now.
 */
export default defineEventHandler(async (): Promise<CollectionDiscoveryResponse> => {
  const curatedCollections = await fetchCuratedCollections();

  return getCollectionDiscoveryMock(curatedCollections);
});

async function fetchCuratedCollections(): Promise<Collection[]> {
  const pageSize = 3;
  const sort = 'starred_desc';
  const [orderByField, orderByDirection] = sort.split('_');

  try {
    const res = await fetchFromTinybird<Collection[]>('/v0/pipes/collections_list.json', {
      count: false,
      page: 0,
      pageSize,
      orderByField,
      orderByDirection,
    });

    const config = useRuntimeConfig();
    const { highlightedIds } = config;
    const parsedIds: string[] = highlightedIds?.split(',') || [];
    const existingHighlightedIds = parsedIds.filter((id: string) =>
      res.data.some((item) => item.id === id),
    );

    if (existingHighlightedIds.length > 0) {
      const highlightedItems = existingHighlightedIds
        .map((highlightId) => res.data.find((item) => item.id === highlightId))
        .filter((item): item is Collection => item !== undefined);

      const nonHighlightedItems = res.data.filter(
        (item) => !existingHighlightedIds.includes(item.id),
      );

      res.data = [...highlightedItems, ...nonHighlightedItems];
    }

    return res.data.map((c) => ({
      ...c,
      likeCount: Math.floor(Math.random() * 100) + 10,
      isLiked: Math.random() > 0.5,
    }));
  } catch (error) {
    console.error('Error fetching curated collections from TinyBird:', error);
    return [];
  }
}
