// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Import } from 'unimport';

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
};
