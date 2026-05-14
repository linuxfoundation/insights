// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fileURLToPath } from 'url';

export default {
  alias: {
    '@lfx-insights/tinybird-client': fileURLToPath(
      new URL('../../libs/tinybird-client/src/index.ts', import.meta.url),
    ),
    '@lfx-insights/types': fileURLToPath(new URL('../../libs/types/src/index.ts', import.meta.url)),
  },
};
