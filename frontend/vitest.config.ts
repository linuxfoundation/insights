// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      happyDom: {
        // happy-dom 21 disables iframe page loading by default; the silent-SSO
        // auth tests rely on iframe contentWindow, so restore the v20 behavior.
        settings: {
          enableIframePageLoading: true,
        },
      },
    },
  },
});
