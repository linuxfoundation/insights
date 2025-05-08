// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';

export interface DateOptionConfig {
  key: string;
  label: string;
  startDate: string | null;
  endDate: string | null;
  description?: string;
}

const now = DateTime.local();

export enum dateOptKeys {
  past90days = 'past90days',
  past180days = 'past180days',
  past365days = 'past365days',
  previousQuarter = 'previousQuarter',
  previousYear = 'previousYear',
  previous5Year = 'previous5Year',
  previous10Year = 'previous10Year',
  alltime = 'alltime',
  custom = 'custom'
}

export const lfxProjectDateOptionsPast: DateOptionConfig[] = [
  {
    key: dateOptKeys.past90days,
    label: 'Past 90 days',
    startDate: now.minus({ days: 90 }).startOf('day').toFormat('yyyy-MM-dd'),
    endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ days: 90 }).toFormat('MMM d, yyyy')} -> Today`
  },
  {
    key: dateOptKeys.past180days,
    label: 'Past 180 days',
    startDate: now.minus({ days: 180 }).startOf('day').toFormat('yyyy-MM-dd'),
    endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ days: 180 }).toFormat('MMM d, yyyy')} -> Today`
  },
  {
    key: dateOptKeys.past365days,
    label: 'Past 365 days',
    startDate: now.minus({ days: 365 }).startOf('day').toFormat('yyyy-MM-dd'),
    endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ days: 365 }).toFormat('MMM d, yyyy')} -> Today`
  }
];

export const lfxProjectDateOptionsPrevious: DateOptionConfig[] = [
  {
    key: dateOptKeys.previousQuarter,
    label: 'Previous quarter',
    startDate: now.minus({ quarters: 1 }).startOf('quarter').toFormat('yyyy-MM-dd'),
    endDate: now.minus({ quarters: 1 }).endOf('quarter').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ quarters: 1 }).startOf('quarter').toFormat('MMM yyyy')} 
        -> ${now.minus({ quarters: 1 }).endOf('quarter').toFormat('MMM yyyy')}`
  },
  {
    key: dateOptKeys.previousYear,
    label: 'Previous year',
    startDate: now.minus({ years: 1 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ years: 1 }).toFormat('yyyy')}`
  },
  {
    key: dateOptKeys.previous5Year,
    label: 'Previous 5 years',
    startDate: now.minus({ years: 5 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ years: 5 }).toFormat('yyyy')} 
        -> ${now.minus({ years: 1 }).endOf('year').toFormat('yyyy')}`
  },
  {
    key: dateOptKeys.previous10Year,
    label: 'Previous 10 years',
    startDate: now.minus({ years: 10 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ years: 10 }).toFormat('yyyy')} 
        -> ${now.minus({ years: 1 }).endOf('year').toFormat('yyyy')}`
  }
];

export const lfxProjectDateOptionsGeneral: DateOptionConfig[] = [
  {
    key: dateOptKeys.alltime,
    label: 'All time',
    startDate: null,
    endDate: null
  }
];

export const lfxProjectDateOptions: DateOptionConfig[] = [
  ...lfxProjectDateOptionsPast,
  ...lfxProjectDateOptionsPrevious,
  ...lfxProjectDateOptionsGeneral
];
