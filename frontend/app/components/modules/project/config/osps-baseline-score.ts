// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {lfxColors} from "~/config/styles/colors";

export interface OspsBaselineScore {
    minScore: number;
    maxScore: number;
    label: string;
    description: string;
    lineColor: string;
    badgeBgColor: string;
    badgeTextColor: string;
}

export const lfxOspsBaselineScore: OspsBaselineScore[] = [
    {
        minScore: 90,
        maxScore: 100,
        label: 'Excellent',
        description: 'No critical issues were detected and most assessments meet or exceed best practices.',
        lineColor: lfxColors.positive[500],
        badgeBgColor: lfxColors.positive[500],
        badgeTextColor: lfxColors.white,
    },
    {
        minScore: 70,
        maxScore: 89,
        label: 'Good',
        description: 'Moderate adherence to best practices, with minor weaknesses that to not pose immediate risks.',
        lineColor: lfxColors.positive[500],
        badgeBgColor: lfxColors.positive[50],
        badgeTextColor: lfxColors.positive[500],
    },
    {
        minScore: 50,
        maxScore: 69,
        label: 'Moderate',
        description: 'Moderate adherence to best practices, with minor weaknesses that to not pose immediate risks.',
        lineColor: lfxColors.warning[500],
        badgeBgColor: lfxColors.warning[50],
        badgeTextColor: lfxColors.warning[600],
    },
    {
        minScore: 30,
        maxScore: 49,
        label: 'Poor',
        description: 'The project is exposed to significant risks,'
            + ' and immediate action is recommended to address security gaps.',
        lineColor: lfxColors.warning[500],
        badgeBgColor: lfxColors.warning[50],
        badgeTextColor: lfxColors.warning[600],
    },
    {
        minScore: 10,
        maxScore: 29,
        label: 'Very poor',
        description: 'The project is highly vulnerable to attacks and is not following standard security practices.',
        lineColor: lfxColors.negative[500],
        badgeBgColor: lfxColors.negative[50],
        badgeTextColor: lfxColors.negative[600],
    },
    {
        minScore: 0,
        maxScore: 9,
        label: 'Critical',
        description: 'Immediate and comprehensive remediation is required to establish a baseline security posture.',
        lineColor: lfxColors.negative[500],
        badgeBgColor: lfxColors.negative[500],
        badgeTextColor: lfxColors.white,
    },
]
