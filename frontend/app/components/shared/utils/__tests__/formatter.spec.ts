// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';
import { formatNumberApprox } from '../formatter';

describe('formatNumberApprox', () => {
  describe('< 1k values', () => {
    it('formats exact integers without prefix or suffix', () => {
      expect(formatNumberApprox(1)).toBe('1');
      expect(formatNumberApprox(500)).toBe('500');
      expect(formatNumberApprox(999)).toBe('999');
    });

    it('rounds decimal values to nearest integer', () => {
      expect(formatNumberApprox(1.5)).toBe('2');
      expect(formatNumberApprox(999.9)).toBe('1,000');
    });
  });

  describe('1k–999k values', () => {
    it('formats with 1 decimal and "k" suffix with ≈ prefix', () => {
      expect(formatNumberApprox(1000)).toBe('≈1.0k');
      expect(formatNumberApprox(1500)).toBe('≈1.5k');
      expect(formatNumberApprox(340000)).toBe('≈340.0k');
      expect(formatNumberApprox(340500)).toBe('≈340.5k');
      expect(formatNumberApprox(999000)).toBe('≈999.0k');
    });
  });

  describe('≥ 1M values', () => {
    it('formats with 1 decimal and "M" suffix with ≈ prefix', () => {
      expect(formatNumberApprox(1000000)).toBe('≈1.0M');
      expect(formatNumberApprox(8000000)).toBe('≈8.0M');
      expect(formatNumberApprox(8500000)).toBe('≈8.5M');
      expect(formatNumberApprox(100000000)).toBe('≈100.0M');
    });
  });

  describe('boundary cases', () => {
    it('handles the 1k boundary correctly', () => {
      expect(formatNumberApprox(999)).toBe('999');
      expect(formatNumberApprox(1000)).toBe('≈1.0k');
    });

    it('handles the 1M boundary correctly', () => {
      expect(formatNumberApprox(999000)).toBe('≈999.0k');
      expect(formatNumberApprox(1000000)).toBe('≈1.0M');
    });
  });
});
