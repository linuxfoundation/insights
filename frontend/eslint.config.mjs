// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

export default withNuxt({
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        map: [['@', './components']],
      },
      typescript: {},
    },
    extends: [...compat.extends('airbnb-base'), ...compat.extends('airbnb-typescript/base')],
  },
});
