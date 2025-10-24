// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import DefaultTheme from 'vitepress/theme';
import './tailwind.postcss';
import './custom.css';
import './cssOverrides';

import BlogLayoutWrapper from './components/BlogLayoutWrapper.vue';

export default {
  extends: DefaultTheme,
  Layout: BlogLayoutWrapper,
};
