import { DateTime } from 'luxon';

export interface DateOptionConfig {
    key: string;
    label: string;
    startDate: string | null;
    endDate: string | null;
    description?: string;
}

const now = DateTime.local();

export const lfxProjectDateOptionsPast: DateOptionConfig[] = [
    {
        key: 'past90days',
        label: 'Past 90 days',
        startDate: now.minus({ days: 90 }).startOf('day').toFormat('yyyy-MM-dd'),
        endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ days: 90 }).toFormat('MMM d, yyyy')} -> Today`
    },
    {
        key: 'past180days',
        label: 'Past 180 days',
        startDate: now.minus({ days: 180 }).startOf('day').toFormat('yyyy-MM-dd'),
        endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ days: 180 }).toFormat('MMM d, yyyy')} -> Today`
    },
    {
        key: 'past365days',
        label: 'Past 365 days',
        startDate: now.minus({ days: 365 }).startOf('day').toFormat('yyyy-MM-dd'),
        endDate: now.endOf('day').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ days: 365 }).toFormat('MMM d, yyyy')} -> Today`
    },
];

export const lfxProjectDateOptionsPrevious: DateOptionConfig[] = [
    {
        key: 'previousQuarter',
        label: 'Previous quarter',
        startDate: now.minus({ quarters: 1 }).startOf('quarter').toFormat('yyyy-MM-dd'),
        endDate: now.minus({ quarters: 1 }).endOf('quarter').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ quarters: 1 }).startOf('quarter').toFormat('MMM yyyy')} 
        -> ${now.minus({ quarters: 1 }).endOf('quarter').toFormat('MMM yyyy')}`
    },
    {
        key: 'previousYear',
        label: 'Previous year',
        startDate: now.minus({ years: 1 }).startOf('year').toFormat('yyyy-MM-dd'),
        endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ years: 1 }).toFormat('yyyy')}`
    },
    {
        key: 'previous5Year',
        label: 'Previous 5 years',
        startDate: now.minus({ years: 5 }).startOf('year').toFormat('yyyy-MM-dd'),
        endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ years: 5 }).toFormat('yyyy')} 
        -> ${now.minus({ years: 1 }).endOf('year').toFormat('yyyy')}`
    },
    {
        key: 'previous10Year',
        label: 'Previous 10 years',
        startDate: now.minus({ years: 10 }).startOf('year').toFormat('yyyy-MM-dd'),
        endDate: now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd'),
        description: `${now.minus({ years: 10 }).toFormat('yyyy')} 
        -> ${now.minus({ years: 1 }).endOf('year').toFormat('yyyy')}`
    },
];

export const lfxProjectDateOptionsGeneral: DateOptionConfig[] = [
    {
        key: 'alltime',
        label: 'All time',
        startDate: null,
        endDate: null,
    },
];

export const lfxProjectDateOptions: DateOptionConfig[] = [
    ...lfxProjectDateOptionsPast,
    ...lfxProjectDateOptionsPrevious,
    ...lfxProjectDateOptionsGeneral,
];
