// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface DataSummary {
  rowCount: number;
  columns: string[];
  columnStats: Record<string, ColumnStats>;
}

export interface ColumnStats {
  type: 'numeric' | 'string' | 'date' | 'boolean';
  nullCount: number;
  nullPercentage: number;

  // Numeric stats
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
  hasAllZeros?: boolean;

  // String/categorical stats
  distinctCount?: number;
  minLength?: number;
  maxLength?: number;

  // Date stats
  earliestDate?: string;
  latestDate?: string;
  dateRange?: string;
}

/**
 * Generate statistical summary of dataset
 * Token-efficient: ~400-500 tokens for typical dataset
 * No raw data samples sent to LLM - only statistics
 *
 * @param data - Array of data rows
 * @returns Statistical summary optimized for auditor validation
 */
export function generateDataSummary<T extends Record<string, unknown>>(data: T[]): DataSummary {
  if (!data || data.length === 0) {
    return {
      rowCount: 0,
      columns: [],
      columnStats: {},
    };
  }

  const columns = Object.keys(data[0] || {});
  const columnStats: Record<string, ColumnStats> = {};

  for (const col of columns) {
    const values = data.map((row) => row[col]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const nullCount = data.length - nonNullValues.length;
    const nullPercentage = Math.round((nullCount / data.length) * 100);

    if (nonNullValues.length === 0) {
      // All nulls - mark as string type with full null percentage
      columnStats[col] = {
        type: 'string',
        nullCount,
        nullPercentage,
      };
      continue;
    }

    const firstValue = nonNullValues[0];
    let stats: ColumnStats;

    // Numeric columns
    if (typeof firstValue === 'number') {
      const numericValues = nonNullValues as number[];
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const hasAllZeros = numericValues.every((v) => v === 0);

      stats = {
        type: 'numeric',
        nullCount,
        nullPercentage,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        sum,
        avg: Math.round((sum / numericValues.length) * 100) / 100, // Round to 2 decimals
        hasAllZeros,
      };
    }
    // Boolean columns
    else if (typeof firstValue === 'boolean') {
      stats = {
        type: 'boolean',
        nullCount,
        nullPercentage,
        distinctCount: new Set(nonNullValues).size,
      };
    }
    // Date columns (detect date strings)
    else if (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue))) {
      const dates = nonNullValues.map((v) => new Date(v as string));
      const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
      const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

      stats = {
        type: 'date',
        nullCount,
        nullPercentage,
        distinctCount: new Set(nonNullValues).size,
        earliestDate: earliest.toISOString().split('T')[0],
        latestDate: latest.toISOString().split('T')[0],
        dateRange: `${earliest.toISOString().split('T')[0]} to ${latest.toISOString().split('T')[0]}`,
      };
    }
    // String columns
    else {
      const stringValues = nonNullValues.map((v) => String(v));
      stats = {
        type: 'string',
        nullCount,
        nullPercentage,
        distinctCount: new Set(stringValues).size,
        minLength: Math.min(...stringValues.map((s) => s.length)),
        maxLength: Math.max(...stringValues.map((s) => s.length)),
      };
    }

    columnStats[col] = stats;
  }

  return {
    rowCount: data.length,
    columns,
    columnStats,
  };
}
