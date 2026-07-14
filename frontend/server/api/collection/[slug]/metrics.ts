// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { CollectionMetrics, CollectionMetricsTinybird } from '~~/types/collection';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { getOptionalUser } from '~~/server/utils/jwt';

/**
 * API Endpoint: /api/collection/:slug/metrics
 * Method: GET
 * Description: Fetches aggregate insights metrics (project count, unique contributor count,
 * average health score) across all projects in a collection.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the collection.
 *
 * Response:
 * - projectCount (number): Count of projects (+ standalone repos) in the collection, from Postgres -
 *   the same source of truth as the collection's project table, so it can't drift from what the
 *   page actually lists.
 * - uniqueContributorCount (number): Total unique contributors across all projects, deduplicated.
 * - avgHealthScore (number): Average Health Score across the collection's projects.
 *
 * Errors:
 * - 404: Collection not found
 * - 503: Database not available
 * - 500: Internal server error
 */
// avgHealthScore is omitted (not 0) when there's no real data - a genuine score of 0
// is distinct from "unavailable," and the metrics-row UI treats undefined as "-".
const EMPTY_TINYBIRD_METRICS = { uniqueContributorCount: 0, avgHealthScore: undefined };

export default defineEventHandler(async (event): Promise<CollectionMetrics> => {
  const { slug } = event.context.params as Record<string, string>;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  const repo = new CommunityCollectionRepository(cmDbPool);
  const user = getOptionalUser(event);
  const result = await repo.findProjectIdsBySlug(slug, user?.sub ?? null);

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
  }

  const projectCount = result.projectIds.length + result.repositoryUrls.length;

  const { uniqueContributorCount, avgHealthScore } = await (async () => {
    try {
      const response = await fetchFromTinybird<CollectionMetricsTinybird[]>(
        '/v0/pipes/collection_insights_aggregate.json',
        {
          collectionSlug: slug,
        },
      );

      const [metrics] = response.data;

      return {
        uniqueContributorCount: metrics?.uniqueContributorCount ?? 0,
        // Normalize Tinybird's null ("no rows to average") to undefined, matching
        // CollectionMetrics' "no data" contract used by the metrics-row UI.
        avgHealthScore: metrics?.avgHealthScore ?? undefined,
      };
    } catch (tinybirdError: unknown) {
      // Degrade gracefully: this is a supplementary aggregate widget, so an upstream
      // Tinybird failure should render partial data (project count still works) rather
      // than break the page.
      console.error('Error fetching collection metrics from Tinybird:', tinybirdError);
      return EMPTY_TINYBIRD_METRICS;
    }
  })();

  return {
    projectCount,
    uniqueContributorCount,
    avgHealthScore,
  };
});
