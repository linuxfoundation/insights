// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { cumulative, newMentions } from '~~/server/mocks/github-mentions.mock'

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
 *     mentions: number; // count of mentions
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
  const query = getQuery(event)
  let data

  if (query.type === 'cumulative') {
    data = cumulative
  } else {
    data = newMentions
  }

  // doing fake changes to data if query.repository is not empty
  if (query.repository) {
    data.data = data.data.map((item) => ({
      ...item,
      mentions: item.mentions - 100,
    }))
  }

  return data
})
