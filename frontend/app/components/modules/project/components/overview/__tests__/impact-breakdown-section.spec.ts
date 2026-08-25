// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';
import {
  getTransitiveDependentsDescription,
  getGraphCentralityDescription,
  getDownloadsDescription,
  getDirectDependentsDescription,
  getImpactSummaryDescription,
} from '~~/config/health-breakdown-templates';

describe('Impact Breakdown signal descriptions', () => {
  describe('getTransitiveDependentsDescription', () => {
    it('returns base message when value is null', () => {
      const result = getTransitiveDependentsDescription(null);
      expect(result).toBe('No transitive dependent data is available for this project.');
    });

    it('returns formatted message with value when not null', () => {
      const result = getTransitiveDependentsDescription(50000);
      expect(result).toContain('50,000');
      expect(result).toContain('blast radius');
    });
  });

  describe('getDownloadsDescription', () => {
    it('returns base message when value is null', () => {
      const result = getDownloadsDescription(null);
      expect(result).toBe('No package download data is available for this project.');
    });

    it('returns formatted message with value when not null', () => {
      const result = getDownloadsDescription(5000000);
      expect(result).toContain('5,000,000');
      expect(result).toContain('month');
    });
  });

  describe('getDirectDependentsDescription', () => {
    it('returns base message when value is null', () => {
      const result = getDirectDependentsDescription(null);
      expect(result).toBe('No direct dependent data is available for this project.');
    });

    it('returns formatted message with value when not null', () => {
      const result = getDirectDependentsDescription(1000);
      expect(result).toContain('1,000');
      expect(result).toContain('depend directly');
    });
  });

  describe('getGraphCentralityDescription', () => {
    it('returns pending message when isPending is true', () => {
      const result = getGraphCentralityDescription(null, true);
      expect(result).toContain('not yet been computed');
    });

    it('returns base message when value is null and not pending', () => {
      const result = getGraphCentralityDescription(null, false);
      expect(result).toBe('No graph centrality data is available for this project.');
    });

    it('returns formatted message with value when not null', () => {
      const result = getGraphCentralityDescription(42.5, false);
      expect(result).toContain('42.5');
      expect(result).toContain('PageRank');
    });
  });

  describe('getImpactSummaryDescription', () => {
    it('returns null availability message when impactLabel is null', () => {
      const result = getImpactSummaryDescription(null);
      expect(result).toContain('no tracked packages');
    });

    it('returns foundational description for foundational label', () => {
      const result = getImpactSummaryDescription('foundational', 100000);
      expect(result).toContain('Near-total blast radius');
      expect(result).toContain('100,000');
    });

    it('returns major description for major label', () => {
      const result = getImpactSummaryDescription('major', 50000);
      expect(result).toContain('Large blast radius');
      expect(result).toContain('50,000');
    });

    it('returns moderate description for moderate label', () => {
      const result = getImpactSummaryDescription('moderate', 10000);
      expect(result).toContain('Moderate blast radius');
      expect(result).toContain('10,000');
    });

    it('returns limited description for other labels', () => {
      const result = getImpactSummaryDescription('limited', 1000);
      expect(result).toContain('Narrow blast radius');
      expect(result).toContain('1,000');
    });

    it('returns description without dependents detail when transitiveDependents is undefined', () => {
      const result = getImpactSummaryDescription('foundational');
      expect(result).toBe('Near-total blast radius across the dependency graph.');
      expect(result).not.toContain('packages depend');
    });
  });
});
