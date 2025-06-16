// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  type SecurityData,
  SecurityDataCategory,
  SecurityDataResult,
} from '~~/types/security/responses.types';
import {
  lfxOspsBaselineScore,
  type OspsBaselineScore,
} from '~/components/modules/project/config/osps-baseline-score';
import { lfxColors } from '~/config/styles/colors';

export interface OverviewQueryParams {
  projectSlug: string;
  repository?: string;
}

export interface ScoreDataQueryParams extends OverviewQueryParams {
  type: string;
}

// TODO: Refactor other services to follow this pattern
class ProjectSecurityService {
  // TODO: Remove this when we have data for them
  /**
   * This function removes the "Documentation" and "Vulnerability Management" categories from the data
   * @param data
   * @returns
   */
  removeDocumentationAndVulnerability(data: SecurityData[]): SecurityData[] {
    console.log(data);
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.filter(
        (item) => item.category !== SecurityDataCategory.DOCUMENTATION
            && item.category !== SecurityDataCategory.VULNERABILITY_MANAGEMENT
    );
  }

  calculateOSPSScore(data: SecurityData[], isRepository: boolean): number {
    if (data.length === 0) {
      return 0;
    }

    if (isRepository) {
      const assessments = (data || []).map((check) => check.assessments).flat();
      const passed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.PASSED
      );
      const failed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.FAILED
      );
      const total = passed.length + failed.length;
      return Math.round((passed.length / total) * 100);
    }

    // Group checks by category
    const grouppedByCategory = (data || []).reduce((mapping, check) => {
      const obj = { ...mapping };
      if (!obj[check.category]) {
        obj[check.category] = [];
      }
      obj[check.category]?.push(check);
      return obj;
    }, {} as Record<string, SecurityData[]>);

    const percentageByCategory: Record<string, number> = {};

    Object.keys(grouppedByCategory).forEach((category) => {
      const assessments = (grouppedByCategory[category] || [])
        .map((check) => check.assessments)
        .flat();
      const passed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.PASSED
      );
      const failed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.FAILED
      );
      const total = passed.length + failed.length;
      percentageByCategory[category] = passed.length / total;
    });

    const passingRateSum = Object.values(percentageByCategory).reduce(
      (sum, value) => sum + value,
      0
    );

    return Math.round((passingRateSum / Object.keys(percentageByCategory).length) * 100);
  }

  getOSPSconfig(results: number): OspsBaselineScore {
    return (
      lfxOspsBaselineScore.find((item) => results >= item.minScore && results <= item.maxScore) || {
        minScore: 0,
        maxScore: 100,
        label: 'No data available',
        description: '',
        lineColor: lfxColors.neutral[200],
        badgeBgColor: lfxColors.neutral[100],
        badgeTextColor: lfxColors.neutral[500],
      }
    );
  }
}

export const PROJECT_SECURITY_SERVICE = new ProjectSecurityService();
