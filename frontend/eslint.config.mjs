import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import withNuxt from './.nuxt/eslint.config.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname
});
const getRules = (extendedRules, excludeKeys = null) => {
  const rules = extendedRules
    .filter((rule) => rule.rules)
    .map((rule) => rule.rules)
    .reduce((r, c) => Object.assign(r, c), {});

  if (excludeKeys) {
    // remove all the properties from the rules object that matches the excludeKeys string
    // these keys from airbnb rules are not supported by eslint 9
    Object.keys(rules).forEach((key) => {
      if (key.includes(excludeKeys)) {
        delete rules[key];
      }
    });
  }

  delete rules['max-len'];

  return rules;
};

export default withNuxt({
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        map: [
          ['@', './app'],
          ['~', './app']
        ]
      },
      typescript: {}
    }
    // extends: [...compat.extends('airbnb-base'), ...compat.extends('airbnb-typescript/base')],
  },
  ignores: ['*.config.*js', '.tailwind/*'],
  rules: {
    ...getRules(compat.extends('airbnb-base')),
    ...getRules(compat.extends('airbnb-typescript/base'), '@typescript-eslint/'),
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'error',
    'vue/first-attribute-linebreak': 'error',
    'vue/max-attributes-per-line': 'error',
    'vue/html-closing-bracket-newline': 'error',
    'vue/html-closing-bracket-spacing': 'warn',
    'vue/html-indent': 'warn',
    'vue/html-self-closing': 'warn',
    'vue/html-button-has-type': 'warn',
    'vue/no-multiple-template-root': 'off',
    'import/order': 'warn',
    'no-unused-vars': 'off',
    'vue/no-v-html': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'class-methods-use-this': 'off',
    'no-shadow': 'off',
    'vuejs-accessibility/mouse-events-have-key-events': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'func-names': 'off',
    'import/no-cycle': 'off',
    'vue/max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true
      }
    ],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true
      }
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        '': 'never'
      }
    ]
  }
});
