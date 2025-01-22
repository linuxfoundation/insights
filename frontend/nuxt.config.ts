// https://nuxt.com/docs/api/configuration/nuxt-config
// import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@primevue/nuxt-module'],
  tailwindcss: {
    exposeConfig: true,
    viewer: { endpoint: '/_tailwind', exportViewer: true },
  },
  css: ['~/assets/styles/main.scss'],
  primevue: {
    options: {
      theme: 'none',
    },
  },
});
