const { getThemeReplacementsValues } = require('./.tailwind/colorConverter.js');

const themeReplacements = getThemeReplacementsValues();

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    colors: {
      transparent: 'var(--lfx-color-transparent)',
      current: 'currentColor',
      black: 'var(--lfx-color-black)',
      white: 'var(--lfx-color-white)',
      brand: {
        900: 'var(--lfx-color-brand-900)',
        800: 'var(--lfx-color-brand-800)',
        700: 'var(--lfx-color-brand-700)',
        600: 'var(--lfx-color-brand-600)',
        500: 'var(--lfx-color-brand-500)',
        400: 'var(--lfx-color-brand-400)',
        300: 'var(--lfx-color-brand-300)',
        200: 'var(--lfx-color-brand-200)',
        100: 'var(--lfx-color-brand-100)',
        50: 'var(--lfx-color-brand-50)',
      },
      neutral: {
        900: 'var(--lfx-color-neutral-900)',
        800: 'var(--lfx-color-neutral-800)',
        700: 'var(--lfx-color-neutral-700)',
        600: 'var(--lfx-color-neutral-600)',
        500: 'var(--lfx-color-neutral-500)',
        400: 'var(--lfx-color-neutral-400)',
        300: 'var(--lfx-color-neutral-300)',
        200: 'var(--lfx-color-neutral-200)',
        100: 'var(--lfx-color-neutral-100)',
        50: 'var(--lfx-color-neutral-50)',
      },
      positive: {
        900: 'var(--lfx-color-positive-900)',
        800: 'var(--lfx-color-positive-800)',
        700: 'var(--lfx-color-positive-700)',
        600: 'var(--lfx-color-positive-600)',
        500: 'var(--lfx-color-positive-500)',
        400: 'var(--lfx-color-positive-400)',
        300: 'var(--lfx-color-positive-300)',
        200: 'var(--lfx-color-positive-200)',
        100: 'var(--lfx-color-positive-100)',
        50: 'var(--lfx-color-positive-50)',
      },
      negative: {
        900: 'var(--lfx-color-negative-900)',
        800: 'var(--lfx-color-negative-800)',
        700: 'var(--lfx-color-negative-700)',
        600: 'var(--lfx-color-negative-600)',
        500: 'var(--lfx-color-negative-500)',
        400: 'var(--lfx-color-negative-400)',
        300: 'var(--lfx-color-negative-300)',
        200: 'var(--lfx-color-negative-200)',
        100: 'var(--lfx-color-negative-100)',
        50: 'var(--lfx-color-negative-50)',
      },
      warning: {
        900: 'var(--lfx-color-warning-900)',
        800: 'var(--lfx-color-warning-800)',
        700: 'var(--lfx-color-warning-700)',
        600: 'var(--lfx-color-warning-600)',
        500: 'var(--lfx-color-warning-500)',
        400: 'var(--lfx-color-warning-400)',
        300: 'var(--lfx-color-warning-300)',
        200: 'var(--lfx-color-warning-200)',
        100: 'var(--lfx-color-warning-100)',
        50: 'var(--lfx-color-warning-50)',
      },
    },
    fontFamily: {
      primary: ['var(--lfx-font-primary)', 'sans-serif'],
      secondary: ['var(--lfx-font-secondary)', 'sans-serif'],
    },

    configViewer: {
      themeReplacements,
    },
    extend: {
      boxShadow: {
        DEFAULT: 'var(--shadow-default)',
      },
      borderColor: {
        DEFAULT: 'var(--lfx-color-gray-200)',
      },
    },
  },
  plugins: [],
};
