import {lfxColors} from "./components/config/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    colors: lfxColors,
    fontFamily: {
      primary: ['var(--lfx-font-primary)', 'sans-serif'],
      secondary: ['var(--lfx-font-secondary)', 'sans-serif'],
    },
    fontSize: {
      'xs': ['var(--lfx-font-size-xs)'],
      'sm': ['var(--lfx-font-size-sm)'],
      'base': ['var(--lfx-font-size-base)'],
      'lg': ['var(--lfx-font-size-lg)'],
      'xl': ['var(--lfx-font-size-xl)'],
      '2xl': ['var(--lfx-font-size-2xl)'],
      '3xl': ['var(--lfx-font-size-3xl)'],
      '4xl': ['var(--lfx-font-size-4xl)'],
      'data-display-1': ['var(--lfx-text-data-display-1-font-size)', 'var(--lfx-text-data-display-1-line-height)'],
      'data-display-2': ['var(--lfx-text-data-display-2-font-size)', 'var(--lfx-text-data-display-2-line-height)'],
      'heading-1': ['var(--lfx-text-heading-1-font-size)', 'var(--lfx-text-heading-1-line-height)'],
      'heading-2': ['var(--lfx-text-heading-2-font-size)', 'var(--lfx-text-heading-2-line-height)'],
      'heading-3': ['var(--lfx-text-heading-3-font-size)', 'var(--lfx-text-heading-3-line-height)'],
      'heading-4': ['var(--lfx-text-heading-4-font-size)', 'var(--lfx-text-heading-4-line-height)'],
      'body-1': ['var(--lfx-text-body-1-font-size)', 'var(--lfx-text-body-1-line-height)'],
      'body-2': ['var(--lfx-text-body-2-font-size)', 'var(--lfx-text-body-2-line-height)'],
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
