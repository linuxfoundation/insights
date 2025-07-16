// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TrustScoreSummary } from "~~/types/overview/responses.types";
import type { ScoreDisplay } from "~~/types/overview/score-display.types";

/**
 * Calculate the overall score based on the score display
 * @param summary - The summary of the trust score
 * @param scoreDisplay - The score display
 * @returns The overall score
 */
export const overviewScore = (summary: TrustScoreSummary | undefined, scoreDisplay: ScoreDisplay)
: TrustScoreSummary => {
    if (!summary) {
        return {
            overall: 0,
            popularity: 0,
            contributors: 0,
            security: 0,
            development: 0,
        };
    }

    return {
        overall: scoreDisplay.overall ? summary.overall : 0,
        popularity: scoreDisplay.popularity ? summary.popularity : 0,
        contributors: scoreDisplay.contributors ? summary.contributors: 0,
        security: scoreDisplay.security ? summary.security : 0,
        development: scoreDisplay.development ? summary.development : 0,
    }
};
