// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fileURLToPath } from 'url';

export default {
  resolve: {
    alias: {
      '@lfx-insights/tinybird-client': fileURLToPath(
        new URL('../../libs/tinybird-client/src/index.ts', import.meta.url),
      ),
      '@lfx-insights/types': fileURLToPath(
        new URL('../../libs/types/src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    proxy: {
      '/docs': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/docs/, '/docs'),
      },
      '/blog': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/blog/, '/blog'),
      },
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Only split heavy visualization libraries to avoid breaking Vue reactivity
          if (id.includes('node_modules')) {
            // ECharts is heavy and self-contained - safe to split
            if (id.includes('echarts')) {
              return 'echarts';
            }
            if (id.includes('primevue')) {
              return 'primevue';
            }
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }
            if (id.includes('pinia')) {
              return 'pinia';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
};
