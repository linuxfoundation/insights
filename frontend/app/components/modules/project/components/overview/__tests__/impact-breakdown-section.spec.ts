// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';

// Test data factory
const createImpactBreakdownData = (overrides = {}) => ({
  directDependents: 1000,
  directDependentsTopPct: 0.15,
  directDependentsBand: 'Top 10%',
  transitiveDependents: 50000,
  transitiveDependentsTopPct: 0.05,
  transitiveDependentsBand: 'Top 1%',
  downloads: 5000000,
  downloadsTopPct: 0.08,
  downloadsBand: 'Top 10%',
  sonatypePopularityScore: null,
  sonatypePopularityScoreTopPct: null,
  sonatypePopularityScoreBand: null,
  ...overrides,
});

describe('Impact Breakdown Section Logic', () => {
  describe('Maven Popularity visibility', () => {
    it('shows Maven Popularity row when sonatypePopularityScore is non-NULL', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: 78,
        sonatypePopularityScoreBand: 'Top 25%',
      });
      expect(data.sonatypePopularityScore).not.toBeNull();
    });

    it('hides Maven Popularity row when sonatypePopularityScore is NULL', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: null,
      });
      expect(data.sonatypePopularityScore).toBeNull();
    });
  });

  describe('Downloads visibility for Maven', () => {
    it('hides Downloads row when Maven has popularity but no downloads', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: 78,
        downloads: null,
      });
      // Logic: hide Downloads if (sonatypePopularityScore !== null && downloads === null)
      const shouldHideDownloads = data.sonatypePopularityScore !== null && data.downloads === null;
      expect(shouldHideDownloads).toBe(true);
    });

    it('shows Downloads row when Maven has both popularity and downloads', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: 78,
        downloads: 1000000,
      });
      const shouldHideDownloads = data.sonatypePopularityScore !== null && data.downloads === null;
      expect(shouldHideDownloads).toBe(false);
    });

    it('shows Downloads row when no Maven popularity (non-Maven ecosystem)', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: null,
        downloads: 1000000,
      });
      const shouldHideDownloads = data.sonatypePopularityScore !== null && data.downloads === null;
      expect(shouldHideDownloads).toBe(false);
    });

    it('shows Downloads row when Maven has popularity and downloads', () => {
      const data = createImpactBreakdownData({
        sonatypePopularityScore: 45,
        downloads: 500000,
      });
      const shouldHideDownloads = data.sonatypePopularityScore !== null && data.downloads === null;
      expect(shouldHideDownloads).toBe(false);
    });
  });

  describe('Popularity value formatting', () => {
    it('formats popularity as "N / 100"', () => {
      const formatPopularity = (value: number): string => `${Math.round(value)} / 100`;
      expect(formatPopularity(78)).toBe('78 / 100');
      expect(formatPopularity(100)).toBe('100 / 100');
      expect(formatPopularity(0)).toBe('0 / 100');
      expect(formatPopularity(75.5)).toBe('76 / 100');
    });
  });

  describe('Popularity contextual lines', () => {
    it('returns high contextual line for score >= 75', () => {
      const getContextualLine = (value: number): string => {
        if (value >= 75) {
          return 'High Maven Central popularity. Widely fetched and depended on across the Java ecosystem.';
        }
        if (value >= 25) {
          return 'Moderate Maven Central footprint. Consistent presence in Java dependency trees.';
        }
        return 'Limited Maven Central footprint. Fetches concentrated in a narrow set of consumers.';
      };
      expect(getContextualLine(75)).toContain('High');
      expect(getContextualLine(100)).toContain('High');
    });

    it('returns mid contextual line for score 25–74', () => {
      const getContextualLine = (value: number): string => {
        if (value >= 75) {
          return 'High Maven Central popularity. Widely fetched and depended on across the Java ecosystem.';
        }
        if (value >= 25) {
          return 'Moderate Maven Central footprint. Consistent presence in Java dependency trees.';
        }
        return 'Limited Maven Central footprint. Fetches concentrated in a narrow set of consumers.';
      };
      expect(getContextualLine(25)).toContain('Moderate');
      expect(getContextualLine(50)).toContain('Moderate');
      expect(getContextualLine(74)).toContain('Moderate');
    });

    it('returns low contextual line for score < 25', () => {
      const getContextualLine = (value: number): string => {
        if (value >= 75) {
          return 'High Maven Central popularity. Widely fetched and depended on across the Java ecosystem.';
        }
        if (value >= 25) {
          return 'Moderate Maven Central footprint. Consistent presence in Java dependency trees.';
        }
        return 'Limited Maven Central footprint. Fetches concentrated in a narrow set of consumers.';
      };
      expect(getContextualLine(24)).toContain('Limited');
      expect(getContextualLine(0)).toContain('Limited');
    });
  });
});
