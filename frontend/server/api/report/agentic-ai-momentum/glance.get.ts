// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchAgenticGlance } from '~~/server/data/tinybird/report/agentic-ai-momentum';
import type { AgenticGlanceData } from '~~/types/report/agentic-ai-momentum.types';

export default defineEventHandler(async (): Promise<AgenticGlanceData> => {
  try {
    return await fetchAgenticGlance();
  } catch (error: unknown) {
    console.error('[agentic-ai-momentum/glance] error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch agentic AI glance data',
    });
  }
});
