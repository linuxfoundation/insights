// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TrustScoreSummary } from "~~/types/overview/responses.types";
import type { ScoreDisplay } from "~~/types/overview/score-display.types";

/**
 * Normalize the value to a range of 0-100
 * @param value - The value to normalize
 * @returns The normalized value
 */
const normalizeChartValue = (value: number) => (value / 25) * 100;

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
        popularity: normalizeChartValue(
            scoreDisplay.popularity ? summary.popularity : 0
        ),
        contributors: normalizeChartValue(
            scoreDisplay.contributors ? summary.contributors: 0
        ),
        security: normalizeChartValue(
            scoreDisplay.security ? summary.security : 0
        ),
        development: normalizeChartValue(
            scoreDisplay.development ? summary.development : 0
        ),
    }
};
