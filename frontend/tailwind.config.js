import {lfxColors} from "./app/components/config/styles/colors.ts";
import {lfxFontSizes} from "./app/components/config/styles/font-size.ts";

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens:{
      sm: '640px',
      md: '768px',
      lg: '1080px',
      xl: '1280px',
      '2xl': '1440px',
    },
    colors: lfxColors,
    fontFamily: {
      primary: ['var(--lfx-font-primary)', 'sans-serif'],
      secondary: ['var(--lfx-font-secondary)', 'sans-serif'],
    },
    fontSize: {
      ...lfxFontSizes,
      'data-display-1': ['var(--lfx-text-data-display-1-font-size)', 'var(--lfx-text-data-display-1-line-height)'],
      'data-display-2': ['var(--lfx-text-data-display-2-font-size)', 'var(--lfx-text-data-display-2-line-height)'],
      'heading-1': ['var(--lfx-text-heading-1-font-size)', 'var(--lfx-text-heading-1-line-height)'],
      'heading-2': ['var(--lfx-text-heading-2-font-size)', 'var(--lfx-text-heading-2-line-height)'],
      'heading-3': ['var(--lfx-text-heading-3-font-size)', 'var(--lfx-text-heading-3-line-height)'],
      'heading-4': ['var(--lfx-text-heading-4-font-size)', 'var(--lfx-text-heading-4-line-height)'],
      'body-1': ['var(--lfx-text-body-1-font-size)', 'var(--lfx-text-body-1-line-height)'],
      'body-2': ['var(--lfx-text-body-2-font-size)', 'var(--lfx-text-body-2-line-height)'],
    },

    boxShadow: {
      DEFAULT: 'var(--lfx-shadow-default)',
      none: 'var(--lfx-shadow-none)',
      sm: 'var(--lfx-shadow-sm)',
      md: 'var(--lfx-shadow-md)',
      lg: 'var(--lfx-shadow-lg)',
      xl: 'var(--lfx-shadow-xl)',
      '2xl': 'var(--lfx-shadow-2xl)',
    },

    borderRadius: {
      none: '0',
      sm: 'var(--lfx-radius-sm)',
      DEFAULT: 'var(--lfx-radius-default)',
      md: 'var(--lfx-radius-md)',
      lg: 'var(--lfx-radius-lg)',
      xl: 'var(--lfx-radius-xl)',
      '2xl': 'var(--lfx-radius-2xl)',
      '3xl': 'var(--lfx-radius-3xl)',
      full: '9999px',

    },

    extend: {
      height: {
        18: '4.5rem',
      },
      outlineWidth:{
        3: '0.1875rem'
      }
    },
  },
  plugins: [],
};
