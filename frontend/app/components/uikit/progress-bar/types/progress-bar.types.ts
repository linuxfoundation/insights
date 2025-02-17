export const progressBarTypes = ['normal', 'positive', 'warning', 'negative'] as const;

export type ProgressBarType = (typeof progressBarTypes)[number];
