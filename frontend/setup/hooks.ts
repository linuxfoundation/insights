// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { fileURLToPath } from 'node:url';
import type { Import } from 'unimport';

type NitroConfigWithErrorHandler = { errorHandler?: string | string[] };

export default {
  'imports:extend': (imports: Import[]) => {
    // Remove nuxt-gtag's useTrackEvent to avoid duplicate with @nuxtjs/plausible
    const gtagTrackEventIndex = imports.findIndex(
      (i) => i.as === 'useTrackEvent' && i.from?.includes('nuxt-gtag'),
    );
    if (gtagTrackEventIndex !== -1) {
      imports.splice(gtagTrackEventIndex, 1);
    }
  },
  // By the time this hook fires, Nuxt has already assigned its own default error page
  // handler to nitroConfig.errorHandler (@nuxt/nitro-server sets it before calling this
  // hook). Prepending here composes with it instead of overwriting it — setting
  // nitro.errorHandler directly in nuxt.config would disable Nuxt's own error page
  // site-wide, not just for /_og/ routes.
  'nitro:config': (nitroConfig: NitroConfigWithErrorHandler) => {
    // Assign to a variable before use: `new URL('...', import.meta.url)` written inline is a
    // special asset-resolution pattern that Vite's bundler statically detects and rewrites for
    // browser/dev-server asset URLs — under Vitest's happy-dom environment that resolves against
    // `window.location` instead of this file's path. Routing import.meta.url through a variable
    // first avoids the pattern match and resolves correctly everywhere.
    const moduleUrl = import.meta.url;
    const ogImageHandler = fileURLToPath(
      new URL('../server/utils/og-image-error-handler.ts', moduleUrl),
    );
    const existing = nitroConfig.errorHandler ? [nitroConfig.errorHandler].flat() : [];
    nitroConfig.errorHandler = [ogImageHandler, ...existing];
  },
};
