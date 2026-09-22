// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import DefaultTheme from 'vitepress/theme';
import './tailwind.postcss';
import './custom.css';
import './cssOverrides';

import { h } from 'vue';
import CustomLfxFooter from './components/CustomLfxFooter.vue';
import { theme, useOpenapi } from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import spec from '../../openapi.json';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx);
    useOpenapi({
      spec,
      config: {
        spec: {
          disableDownload: true,
        },
      },
    });
    theme.enhanceApp(ctx);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(CustomLfxFooter),
    });
  },
};
