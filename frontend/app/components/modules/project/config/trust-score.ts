// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {TagStyle} from "~/components/uikit/tag/types/tag.types";

export interface TrustScoreConfig {
    maxScore: number;
    minScore: number;
    label: string;
    tagStyle: TagStyle;
    ghBadgeColor: string;
}

export const lfxTrustScore: TrustScoreConfig[] = [
    {
        maxScore: 100,
        minScore: 80,
        label: 'Rock solid',
        tagStyle: 'positive-solid',
        ghBadgeColor: '#10B981'
    },
    {
        maxScore: 79,
        minScore: 60,
        label: 'Healthy',
        tagStyle: 'positive',
        ghBadgeColor: '#A7F3D0'
    },
    {
        maxScore: 59,
        minScore: 40,
        label: 'Stable',
        tagStyle: 'info',
        ghBadgeColor: '#0094FF'
    },
    {
        maxScore: 39,
        minScore: 20,
        label: 'Unsteady',
        tagStyle: 'warning',
        ghBadgeColor: '#F59E0B'
    },
    {
        maxScore: 19,
        minScore: 0,
        label: 'Critical',
        tagStyle: 'negative-solid',
        ghBadgeColor: '#EF4444'
    }
]
