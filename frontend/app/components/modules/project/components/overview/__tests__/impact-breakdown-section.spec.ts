// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';
import {
  getTransitiveDependentsDescription,
  getPopularityDescription,
  getDownloadsDescription,
  getDirectDependentsDescription,
  getImpactSummaryDescription,
} from '~~/config/health-breakdown-templates';

// Test data factory for Maven Popularity / Downloads visibility logic
const createImpactBreakdownData = (overrides = {}) => ({
  directDependents: 1000,
  directDependentsBand: 'Top 10%',
  transitiveDependents: 50000,
  transitiveDependentsBand: 'Top 1%',
  downloads: 5000000,
  downloadsBand: 'Top 10%',
  sonatypePopularityScore: null,
  sonatypePopularityScoreBand: null,
  ...overrides,
});

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

  describe('getPopularityDescription', () => {
    it('returns base message when value is null', () => {
      const result = getPopularityDescription(null);
      expect(result).toBe('No Sonatype popularity data is available for this project.');
    });

    it('returns high-popularity description for score >= 75, rounded', () => {
      const result = getPopularityDescription(74.6);
      expect(result).toContain('75 / 100');
      expect(result).toContain('High Maven Central popularity');
    });

    it('returns moderate-popularity description for score 25-74, rounded', () => {
      const result = getPopularityDescription(50);
      expect(result).toContain('50 / 100');
      expect(result).toContain('Moderate Maven Central footprint');
    });

    it('returns limited-popularity description for score < 25, rounded', () => {
      const result = getPopularityDescription(24.4);
      expect(result).toContain('24 / 100');
      expect(result).toContain('Limited Maven Central footprint');
    });
  });

  describe('Maven Popularity row visibility', () => {
    it('shows Popularity row when sonatypePopularityScore is non-NULL', () => {
      const data = createImpactBreakdownData({ sonatypePopularityScore: 78 });
      expect(data.sonatypePopularityScore).not.toBeNull();
    });

    it('hides Popularity row when sonatypePopularityScore is NULL', () => {
      const data = createImpactBreakdownData({ sonatypePopularityScore: null });
      expect(data.sonatypePopularityScore).toBeNull();
    });
  });

  describe('Downloads row visibility for Maven', () => {
    const shouldHideDownloads = (data: ReturnType<typeof createImpactBreakdownData>) =>
      data.sonatypePopularityScore !== null && data.downloads === null;

    it('hides Downloads row when Maven has popularity but no downloads', () => {
      const data = createImpactBreakdownData({ sonatypePopularityScore: 78, downloads: null });
      expect(shouldHideDownloads(data)).toBe(true);
    });

    it('shows Downloads row when Maven has both popularity and downloads', () => {
      const data = createImpactBreakdownData({ sonatypePopularityScore: 78, downloads: 1000000 });
      expect(shouldHideDownloads(data)).toBe(false);
    });

    it('shows Downloads row when no Maven popularity (non-Maven ecosystem)', () => {
      const data = createImpactBreakdownData({ sonatypePopularityScore: null, downloads: 1000000 });
      expect(shouldHideDownloads(data)).toBe(false);
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
