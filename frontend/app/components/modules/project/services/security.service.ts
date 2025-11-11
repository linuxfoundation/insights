// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  type SecurityData,
  SecurityDataResult,
  type SecurityAssessmentData,
  SecurityDataCategory,
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

  removeUnavailableChecks(data: SecurityData[]): SecurityData[] {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const filteredCheck = ['OSPS-AC-01'];

    return data.filter(
      (item) =>
        !filteredCheck.includes(item.controlId) ||
        (item.category !== SecurityDataCategory.DOCUMENTATION &&
          item.category !== SecurityDataCategory.VULNERABILITY_MANAGEMENT),
    );
  }

  hasSecurityMdFile(data: SecurityData[]): boolean {
    const vulnerabilityManagement: SecurityAssessmentData[] =
      data.find((d) => d.controlId === 'OSPS-VM-02')?.assessments || [];
    const securityMdFile: SecurityAssessmentData | undefined = vulnerabilityManagement.find(
      (d) => d.requirementId === 'OSPS-VM-02.01',
    );
    if (!securityMdFile) {
      return false;
    }
    return securityMdFile.result !== SecurityDataResult.FAILED;
  }

  /**
   * Merge duplicate assessments - if there are multiple assessments for the same requirement, merge them
   * There should be only one assessment for each requirement
   * @param assessments SecurityAssessmentData[]
   * @returns SecurityAssessmentData[]
   */
  mergeDuplicateAssessments(assessments: SecurityAssessmentData[]): SecurityAssessmentData[] {
    if (!assessments || !Array.isArray(assessments) || assessments.length === 0) {
      return [];
    }

    return assessments.reduce((acc, assessment) => {
      const existingAssessment = acc.find((a) => a.requirementId === assessment.requirementId);
      if (existingAssessment) {
        existingAssessment.result = assessment.result ?? existingAssessment.result;
        existingAssessment.message = assessment.message ?? existingAssessment.message;
        existingAssessment.recommendation =
          assessment.recommendation ?? existingAssessment.recommendation;
        existingAssessment.description = assessment.description ?? existingAssessment.description;
      } else {
        acc.push(assessment);
      }
      return acc;
    }, [] as SecurityAssessmentData[]) as SecurityAssessmentData[];
  }

  /**
   * Order assessments by requirementId
   * @param data SecurityAssessmentData[]
   * @returns SecurityAssessmentData[]
   */
  orderAssessmentsByRequirementId(data: SecurityAssessmentData[]): SecurityAssessmentData[] {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.sort((a, b) => a.requirementId.localeCompare(b.requirementId));
  }

  calculateOSPSScore(data: SecurityData[], isRepository: boolean): number {
    if (data.length === 0) {
      return 0;
    }

    if (isRepository) {
      const assessments = (data || []).map((check) => check.assessments).flat();
      const passed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.PASSED,
      );
      const failed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.FAILED,
      );
      const total = passed.length + failed.length;
      return Math.round((passed.length / total) * 100);
    }

    // Group checks by category
    const grouppedByCategory = (data || []).reduce(
      (mapping, check) => {
        const obj = { ...mapping };
        if (!obj[check.category]) {
          obj[check.category] = [];
        }
        obj[check.category]?.push(check);
        return obj;
      },
      {} as Record<string, SecurityData[]>,
    );

    const percentageByCategory: Record<string, number> = {};

    Object.keys(grouppedByCategory).forEach((category) => {
      const assessments = (grouppedByCategory[category] || [])
        .map((check) => check.assessments)
        .flat();
      const passed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.PASSED,
      );
      const failed = assessments.filter(
        (assessment) => assessment.result === SecurityDataResult.FAILED,
      );
      const total = passed.length + failed.length;
      percentageByCategory[category] = passed.length / total;
    });

    const passingRateSum = Object.values(percentageByCategory).reduce(
      (sum, value) => sum + value,
      0,
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
