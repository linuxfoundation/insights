import useDate from "~/components/shared/utils/date";

export interface DateOptionConfig {
    key: string;
    label: string;
    startDate: string | null;
    endDate: string | null;
    description?: string;
}

const date = useDate();

export const lfxProjectDateOptionsPast: DateOptionConfig[] = [
    {
        key: 'past90days',
        label: 'Past 90 days',
        startDate: date().subtract(90, 'day').startOf('day').toISOString(),
        endDate: date().endOf('day').toISOString(),
        description: `${date().subtract(90, 'day').format('MMM D, YYYY')} -> Today`
    },
    {
        key: 'past180days',
        label: 'Past 180 days',
        startDate: date().subtract(180, 'day').startOf('day').toISOString(),
        endDate: date().endOf('day').toISOString(),
        description: `${date().subtract(180, 'day').format('MMM D, YYYY')} -> Today`
    },
    {
        key: 'past365days',
        label: 'Past 365 days',
        startDate: date().subtract(365, 'day').startOf('day').toISOString(),
        endDate: date().endOf('day').toISOString(),
        description: `${date().subtract(365, 'day').format('MMM D, YYYY')} -> Today`
    },
];

export const lfxProjectDateOptionsPrevious: DateOptionConfig[] = [
    {
        key: 'previousQuarter',
        label: 'Previous quarter',
        startDate: date().subtract(1, 'quarter').startOf('quarter').toISOString(),
        endDate: date().subtract(1, 'quarter').endOf('quarter').toISOString(),
        description: `${date().subtract(1, 'quarter').startOf('quarter').format('MMM YYYY')} 
        -> ${date().subtract(1, 'quarter').endOf('quarter').format('MMM YYYY')}`
    },
    {
        key: 'previousYear',
        label: 'Previous year',
        startDate: date().subtract(1, 'year').startOf('year').toISOString(),
        endDate: date().subtract(1, 'year').endOf('year').toISOString(),
        description: `${date().subtract(1, 'year').format('YYYY')}`
    },
    {
        key: 'previous5Year',
        label: 'Previous 5 years',
        startDate: date().subtract(5, 'year').startOf('year').toISOString(),
        endDate: date().subtract(1, 'year').endOf('year').toISOString(),
        description: `${date().subtract(5, 'year').format('YYYY')} 
        -> ${date().subtract(1, 'year').endOf('year').format('YYYY')}`
    },
    {
        key: 'previous10Year',
        label: 'Previous 10 years',
        startDate: date().subtract(10, 'year').startOf('year').toISOString(),
        endDate: date().subtract(1, 'year').endOf('year').toISOString(),
        description: `${date().subtract(10, 'year').format('YYYY')} 
        -> ${date().subtract(1, 'year').endOf('year').format('YYYY')}`
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
