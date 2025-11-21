// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { lfxColors } from './app/config/styles/colors.ts';
import { lfxFontSizes } from './app/config/styles/font-size.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/**/*.md',
    './docs/.vitepress/**/*.{js,ts,vue}',
    './docs/.vitepress/theme/**/*.{js,ts,vue}',
    './docs/.vitepress/components/**/*.{js,ts,vue}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: lfxColors,
    fontFamily: {
      primary: ['var(--lfx-font-primary)', 'sans-serif'],
      secondary: ['var(--lfx-font-secondary)', 'sans-serif'],
    },
    fontSize: {
      ...lfxFontSizes,
      'data-display-1': [
        'var(--lfx-text-data-display-1-font-size)',
        'var(--lfx-text-data-display-1-line-height)',
      ],
      'data-display-2': [
        'var(--lfx-text-data-display-2-font-size)',
        'var(--lfx-text-data-display-2-line-height)',
      ],
      'heading-1': ['var(--lfx-text-heading-1-font-size)', 'var(--lfx-text-heading-1-line-height)'],
      'heading-2': ['var(--lfx-text-heading-2-font-size)', 'var(--lfx-text-heading-2-line-height)'],
      'heading-3': ['var(--lfx-text-heading-3-font-size)', 'var(--lfx-text-heading-3-line-height)'],
      'heading-4': ['var(--lfx-text-heading-4-font-size)', 'var(--lfx-text-heading-4-line-height)'],
      'body-1': ['var(--lfx-text-body-1-font-size)', 'var(--lfx-text-body-1-line-height)'],
      'body-2': ['var(--lfx-text-body-2-font-size)', 'var(--lfx-text-body-2-line-height)'],
    },

    boxShadow: {
      none: 'var(--lfx-shadow-none)',
      xs: 'var(--lfx-shadow-xs)',
      sm: 'var(--lfx-shadow-sm)',
      md: 'var(--lfx-shadow-md)',
      lg: 'var(--lfx-shadow-lg)',
      xl: 'var(--lfx-shadow-xl)',
      '2xl': 'var(--lfx-shadow-2xl)',
    },

    borderRadius: {
      none: '0',
      xs: 'var(--lfx-radius-xs)',
      sm: 'var(--lfx-radius-sm)',
      md: 'var(--lfx-radius-md)',
      lg: 'var(--lfx-radius-lg)',
      xl: 'var(--lfx-radius-xl)',
      '2xl': 'var(--lfx-radius-2xl)',
      '3xl': 'var(--lfx-radius-3xl)',
      full: '9999px',
    },

    extend: {
      height: {
        7.5: '1.875rem',
        17: '4.25rem',
        18: '4.5rem',
        29: '7.5rem',
      },
      width: {
        13: '3.25rem',
        51: '12.5rem',
        78: '19.5rem',
        100: '25rem',
        149: '37.25rem',
      },
      maxWidth: {
        50: '12.5rem',
        100: '25rem',
        120: '30rem',
        190: '47.5rem',
        '1/3': '33.333333%',
      },
      minWidth: {
        29: '7.25rem',
        50: '12.5rem',
        150: '37.5rem',
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        17: '4.25rem',
        21: '5.25rem',
        22: '5.5rem',
        25: '6.25rem',
        27: '6.75rem',
        30: '7.5rem',
      },
      outlineWidth: {
        3: '0.1875rem',
      },
      top: {
        29: '7.5rem',
      },
    },
  },
  plugins: [],
};
