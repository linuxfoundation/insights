import type { TooltipComponentOption } from 'echarts/components';

// Workaround for the missing formatter callback params
type Unified<T> = Exclude<T, T[]>;
type TooltipFormatterCallback = Exclude<NonNullable<TooltipComponentOption['formatter']>, string>;
// single and multiple params
export type TooltipFormatterParams = Parameters<TooltipFormatterCallback>[0];
// single params
export type SingleTooltipFormatterParams = Unified<TooltipFormatterParams>;
// multiple params
export type MultipleTooltipFormatterParams = SingleTooltipFormatterParams[];
