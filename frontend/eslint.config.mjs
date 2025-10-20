// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import pluginVue from 'eslint-plugin-vue';
import typescriptEslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
  // Ignore patterns
  {
    ignores: [
      '*.config.*js',
      '.tailwind/*',
      'shims-vue.d.ts',
      'docs/.vitepress/theme/cssOverrides/*',
      'docs/.vitepress/dist/**',
      'blog/.vitepress/dist/**',
      'pnpm-lock.yaml',
      'vitest.config.ts',
      '.nuxt/**',
      'dist/**',
      'node_modules/**',
      '.stress/**',
      '.output/**',
      'storybook-static/**',
      'docs/**',
      '**/.vitepress/**',
    ],
  },

  // JavaScript/TypeScript base configuration
  ...typescriptEslint.configs.recommended,

  // Vue configuration
  ...pluginVue.configs['flat/recommended'],

  // Prettier configuration (must be after other configs to override conflicting rules)
  prettier,

  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },

  // Vue files configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Custom rules for all files
  {
    plugins: {
      import: pluginImport,
      prettier: pluginPrettier,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        },
      },
    },
    rules: {
      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          arrowParens: 'always',
          endOfLine: 'lf',
        },
      ],

      // Console and debugging
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // Vue specific rules
      'vue/no-unused-components': 'error',
      'vue/first-attribute-linebreak': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-button-has-type': 'warn',
      'vue/no-multiple-template-root': 'off',
      'vue/no-required-prop-with-default': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-parsing-error': 'off',
      'vue/no-v-html': 'off',
      'vue/max-len': 'off',

      // Import rules
      'import/order': 'warn',
      'import/prefer-default-export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-cycle': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          '': 'never',
        },
      ],

      // TypeScript rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'max-len': 'off',
      'class-methods-use-this': 'off',
      'no-shadow': 'off',
      'func-names': 'off',
    },
  },
];
