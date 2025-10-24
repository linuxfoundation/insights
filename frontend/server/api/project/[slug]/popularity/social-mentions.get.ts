// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { allTime, newMentions } from '~~/server/mocks/social-mentions.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     startDate: string; // start date
 *     endDate: string; // end date
 *   },
 *   data: {
 *     startDate: string; // start date
 *     endDate: string; // end date
 *     twitter: number; // count of twitter mentions
 *     reddit: number; // count of reddit mentions
 *     hackerNews: number; // count of hackerNews mentions
 *     stackOverflow: number; // count of stackOverflow mentions
 *   }[];
 * }
 */
/**
 * Query params:
 * - granularity: string
 * - type: 'cumulative' | 'new'
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let data;

  if (query.type === 'cumulative') {
    data = allTime;
  } else {
    data = newMentions;
  }

  // doing fake changes to data if query.repository is not empty
  if (query.repository) {
    data.data = data.data.map((item) => ({
      ...item,
      twitter: item.twitter - 300,
      reddit: item.reddit - 100,
      hackerNews: item.hackerNews - 200,
      stackOverflow: item.stackOverflow - 100,
    }));
  }

  return data;
});
