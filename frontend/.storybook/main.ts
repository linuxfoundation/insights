// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { StorybookConfig } from '@storybook-vue/nuxt';

const config: StorybookConfig = {
  stories: ['../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    // '@chromatic-com/storybook', // Disabled: incompatible with Storybook 8.6.x
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
  viteFinal(config) {
    // 🛠️ This filters out the crashing plugin
    const filteredPlugins = config.plugins?.filter(
      (plugin) => plugin?.name !== 'vite-plugin-inspect',
    );

    // Add custom plugin to suppress specific warnings
    const customWarningSuppressionPlugin = {
      name: 'suppress-storybook-warnings',
      configResolved(resolvedConfig: {
        logger: { warn: (msg: string, options?: unknown) => void };
      }) {
        const originalWarn = resolvedConfig.logger.warn;
        resolvedConfig.logger.warn = (msg: string, options?: unknown) => {
          // Suppress virtual module warnings from Storybook
          if (msg.includes('Failed to resolve') && msg.includes('virtual:/@storybook')) {
            return;
          }
          originalWarn(msg, options);
        };
      },
    };

    return {
      ...config,
      plugins: [...(filteredPlugins || []), customWarningSuppressionPlugin],
      server: {
        ...config.server,
        // Suppress proxy errors for Nuxt build metadata
        proxy: undefined,
      },
      build: {
        ...config.build,
        // Suppress rollup warnings about virtual modules
        rollupOptions: {
          ...config.build?.rollupOptions,
          onwarn(warning, warn) {
            // Ignore virtual module warnings
            if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('virtual:')) {
              return;
            }
            warn(warning);
          },
        },
      },
    };
  },
};

export default config;
