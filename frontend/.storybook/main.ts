// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { StorybookConfig } from "@storybook-vue/nuxt";

const config: StorybookConfig = {
  stories: [
    "../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
  viteFinal(config) {
    // 🛠️ This filters out the crashing plugin
    const filteredPlugins = config.plugins?.filter(
        (plugin) => plugin?.name !== 'vite-plugin-inspect'
    );
    return {
        ...config,
        plugins: filteredPlugins,
    };
  },
};

export default config;
