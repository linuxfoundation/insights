// https://nuxt.com/docs/api/configuration/nuxt-config

import head from './setup/head';
import tailwindcss from './setup/tailwind';
import primevue from './setup/primevue';
import echarts from './setup/echarts';

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  app: {
    head,
    errorHandler: '~/app/error.vue'
  },
  components: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook',
    'nuxt-gtag',
    '@nuxtjs/plausible'
  ],
  plugins: [
    '~/plugins/vue-query.ts',
  ],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig: {
    // These are are only available on the server-side and can be overridden by the .env file
    tinybirdBaseUrl: process.env.TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co',
    tinybirdToken: process.env.TINYBIRD_TOKEN || '',
    cmApiUrl: process.env.CM_API_URL || '',
    cmApiToken: process.env.CM_API_TOKEN || '',
    jiraIssueReporterApiUrl: process.env.JIRA_ISSUE_REPORTER_API_URL || '',
    jiraIssueReporterApiTokenEmail: process.env.JIRA_ISSUE_REPORTER_API_TOKEN_EMAIL || '',
    jiraIssueReporterApiToken: process.env.JIRA_ISSUE_REPORTER_API_TOKEN || '',
    jiraIssueReporterProjectKey: process.env.JIRA_ISSUE_REPORTER_PROJECT_KEY || '',

    // These are also exposed on the client-side
    public: {
      apiBase: '/api',
      appUrl: 'http://localhost:3000',
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['lfx-footer'].includes(tag),
    }
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-EB92ZZFBNS'
  },
  plausible: { // Use as fallback if no runtime config is available at runtime
    enabled: process.env.NODE_ENV === 'production',
    domain: 'insights.linuxfoundation.org',
  },
  vite: {
    server: {
      proxy: {
        '/docs': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/docs/, '/docs')
        }
      }
    }
  }
});
