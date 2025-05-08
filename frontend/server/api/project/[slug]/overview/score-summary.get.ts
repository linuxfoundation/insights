// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 * See responses.types.ts for the response format.
 */

import { trustScoreSummary } from '~~/server/mocks/score-data.mock';

/**
 * Query params:
 * - projectSlug: string
 * - repository?: string
 */
export default defineEventHandler(async () => trustScoreSummary);
