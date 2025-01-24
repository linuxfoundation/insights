import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import withNuxt from './.nuxt/eslint.config.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
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

  return rules;
};

export default withNuxt({
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        map: [['@', './components']],
      },
      typescript: {},
    },
    // extends: [...compat.extends('airbnb-base'), ...compat.extends('airbnb-typescript/base')],
  },
  ignores: ['*.config.*js', '.tailwind/*'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'error',
    'vue/html-closing-bracket-spacing': 'warn',
    'vue/html-indent': 'warn',
    'vue/html-self-closing': 'warn',
    'vue/html-button-has-type': 'warn',
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
        code: 150,
        ignoreComments: true,
        ignoreUrls: true,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    ...getRules(compat.extends('airbnb-base')),
    ...getRules(compat.extends('airbnb-typescript/base'), '@typescript-eslint/'),
  },
});
