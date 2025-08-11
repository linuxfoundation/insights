// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Result } from "./types";

export interface DataProfile {
  rowCount: number;
  columns: ColumnProfile[];
  dataShape: 'single-value' | 'time-series' | 'categorical' | 'multi-dimensional';
  pivotNeeded: boolean;
  pivotConfig?: {
    groupBy: string;
    categories: string;
    values: string;
  };
}

export interface ColumnProfile {
  name: string;
  type: 'numeric' | 'date' | 'category' | 'text';
  uniqueCount: number;
  isGroupable: boolean;
  sample: any[];
  role?: 'dimension' | 'measure' | 'time';
}

export function analyzeDataForChart(
  results: Result[],
  userQuestion: string = ""
): DataProfile | null {
  if (!results.length) return null;
  
  const columns = Object.keys(results[0]);
  const columnProfiles = analyzeColumns(results, columns);
  const dataShape = detectDataShape(results, columnProfiles);
  
  const pivotAnalysis = detectPivotNeeds(results, columnProfiles);
  
  return {
    rowCount: results.length,
    columns: columnProfiles,
    dataShape,
    pivotNeeded: pivotAnalysis.needed,
    pivotConfig: pivotAnalysis.config,
  };
}

function analyzeColumns(results: Result[], columns: string[]): ColumnProfile[] {
  return columns.map(col => {
    const values = results.map(row => row[col]);
    const uniqueValues = new Set(values.map(v => String(v)));
    const numericValues = values.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '' && v !== null));
    
    // Detect column type
    let type: ColumnProfile['type'] = 'text';
    let role: ColumnProfile['role'] | undefined;
    
    if (numericValues.length > values.length * 0.8) {
      type = 'numeric';
      role = 'measure';
    } else if (isDateColumn(values)) {
      type = 'date';
      role = 'time';
    } else if (uniqueValues.size <= 20 && uniqueValues.size < values.length * 2) {
      // Consider as category if:
      // - Has 20 or fewer unique values AND
      // - Not every row has a different value (allows some duplicates)
      type = 'category';
      role = 'dimension';
    }
    
    return {
      name: col,
      type,
      uniqueCount: uniqueValues.size,
      isGroupable: type === 'category' && uniqueValues.size < 20,
      sample: Array.from(uniqueValues).slice(0, 3),
      role,
    };
  });
}

function isDateColumn(values: any[]): boolean {
  const dateFormats = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{4}-\d{2}/, // YYYY-MM
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
  ];
  
  const dateCount = values.filter(v => {
    const str = String(v);
    return dateFormats.some(format => format.test(str)) || !isNaN(Date.parse(str));
  }).length;
  
  return dateCount > values.length * 0.6;
}

function detectDataShape(results: Result[], columns: ColumnProfile[]): DataProfile['dataShape'] {
  if (results.length === 1) return 'single-value';
  
  const dateColumns = columns.filter(c => c.type === 'date');
  const numericColumns = columns.filter(c => c.type === 'numeric');
  const categoryColumns = columns.filter(c => c.type === 'category');
  
  if (dateColumns.length > 0) return 'time-series';
  if (categoryColumns.length === 1 && numericColumns.length >= 1) return 'categorical';
  if (categoryColumns.length >= 2 && numericColumns.length >= 1) return 'multi-dimensional';
  
  return 'categorical';
}


function detectPivotNeeds(results: Result[], columns: ColumnProfile[]) {
  if (columns.length !== 3) return { needed: false };
  
  const possibleGroupCol = columns.find(c => 
    c.type === 'category' && c.uniqueCount < results.length * 0.5
  );
  
  const possibleCategoryCol = columns.find(c => 
    c.type === 'category' && 
    c !== possibleGroupCol &&
    c.uniqueCount < 20
  );
  
  const possibleValueCol = columns.find(c => c.type === 'numeric');
  
  if (possibleGroupCol && possibleCategoryCol && possibleValueCol) {
    return {
      needed: true,
      config: {
        groupBy: possibleGroupCol.name,
        categories: possibleCategoryCol.name,
        values: possibleValueCol.name,
      }
    };
  }
  
  return { needed: false };
}

export function pivotLongToWide(
  data: Result[],
  groupColumn: string,
  categoryColumn: string,
  valueColumn: string
): Result[] {
  if (!data || data.length === 0) return data;

  const categories = Array.from(new Set(data.map(row => String(row[categoryColumn])))).sort();
  
  const groupedData = data.reduce((acc, row) => {
    const groupKey = String(row[groupColumn]);
    if (!acc[groupKey]) {
      acc[groupKey] = { [groupColumn]: groupKey };
    }
    
    const categoryKey = String(row[categoryColumn]);
    const value = Number(row[valueColumn]) || 0;
    const cleanCategoryKey = categoryKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
    acc[groupKey][cleanCategoryKey] = value;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedData).map(group => {
    const result = { ...group };
    categories.forEach(category => {
      const cleanCategoryKey = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!(cleanCategoryKey in result)) {
        result[cleanCategoryKey] = 0;
      }
    });
    return result;
  });
}

export function shouldStackBars(profile: DataProfile): boolean {
  const yColumns = profile.columns
    .filter(c => c.type === 'numeric')
    .map(c => c.name.toLowerCase());
  
  const stackingPatterns = [
    ['bronze', 'silver', 'gold'],
    ['small', 'medium', 'large'],
    ['low', 'medium', 'high'],
    ['q1', 'q2', 'q3', 'q4'],
  ];
  
  for (const pattern of stackingPatterns) {
    const matches = pattern.filter(p => 
      yColumns.some(col => col.includes(p))
    );
    if (matches.length >= 2) return true;
  }
  
  return false;
}