// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 * See responses.types.ts for the response format.
 */

import {
  contributorsScoreData,
  popularityScoreData,
  developmentScoreData
} from '~~/server/mocks/score-data.mock';

/**
 * Query params:
 * - projectSlug: string
 * - repository?: string
 * - type: AggregateKey
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const type = query.type as string;

  switch (type) {
    case 'contributors':
      return contributorsScoreData;
    case 'popularity':
      return popularityScoreData;
    case 'development':
      return developmentScoreData;
    // case 'security': // no scores defined for this yet
    //   return securityScoreData;
    default:
      return [];
  }
});
