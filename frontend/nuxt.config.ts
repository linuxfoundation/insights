// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://nuxt.com/docs/api/configuration/nuxt-config

import head from "./setup/head";
import tailwindcss from "./setup/tailwind";
import primevue from "./setup/primevue";
import echarts from "./setup/echarts";
import caching from "./setup/caching";

const isProduction = process.env.NUXT_APP_ENV === "production";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head,
    errorHandler: "~/app/error.vue",
  },
  components: false,
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@primevue/nuxt-module",
    "nuxt-echarts",
    "@nuxtjs/storybook",
    "nuxt-gtag",
    "@nuxtjs/plausible",
    "@nuxtjs/robots",
  ],
  plugins: ["~/plugins/vue-query.ts", "~/plugins/auth0.client.ts"],
  css: ["~/assets/styles/main.scss"],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig: {
    // These are are only available on the server-side and can be overridden by the .env file
    appEnv: process.env.APP_ENV,
    tinybirdBaseUrl: "https://api.us-west-2.aws.tinybird.co",
    tinybirdToken: "",
    highlightedIds: "",
    redisUrl: "",
    githubApiToken: "",
    lfxAuth0JwtSecret: "",
    insightsDbWriteHost: "localhost",
    insightsDbReadHost: "localhost",
    insightsDbPort: 5432,
    insightsDbUsername: "postgres",
    insightsDbPassword: "example",
    insightsDbDatabase: "insights",
    // These are also exposed on the client-side
    public: {
      apiBase: "/api",
      appUrl: "http://localhost:3000",
      appEnv: process.env.APP_ENV,
      auth0Domain: "dev-c8cv2imtriwvtf2w.us.auth0.com",
      auth0ClientId: "IyKSGW1Uh8pPEVGMdK2bfjYDmPlOB902",
      auth0RedirectUri: "http://localhost:3000/callback",
      auth0Audience: "http://localhost:3000/api/",
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ["lfx-footer"].includes(tag),
    },
  },
  gtag: {
    enabled: isProduction,
    id: "G-EB92ZZFBNS",
  },
  plausible: {
    // Use as fallback if no runtime config is available at runtime
    enabled: isProduction,
    domain: "insights.linuxfoundation.org",
  },
  vite: {
    server: {
      proxy: {
        "/docs": {
          target: "http://localhost:5173",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/docs/, "/docs"),
        },
      },
    },
  },
  robots: {
    disallow: isProduction ? [] : ["/"],
  },
  ...caching,
});
