// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/build-docs-fixture.ts'],
    // autoload imports route modules at runtime from inside node_modules, where vitest does not
    // transform .ts files. Inlining it routes those imports through vite's transform.
    server: { deps: { inline: ['@fastify/autoload'] } },
  },
});
