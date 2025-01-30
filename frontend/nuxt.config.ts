// https://nuxt.com/docs/api/configuration/nuxt-config
// import Aura from '@primevue/themes/aura';
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Slab:wght@400;600&display=swap'
        }
      ],
      script: [
        // Using fontawesome like this instead of installing plugins
        { src: 'https://kit.fontawesome.com/b5289aebdf.js' }
      ]
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook'
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: { endpoint: '/_tailwind', exportViewer: true }
  },
  css: ['~/assets/styles/main.scss'],
  primevue: {
    autoImport: false,
    components: {
      prefix: 'pv',
      include: ['Button', 'DataTable', 'Avatar', 'AvatarGroup']
    },
    options: {
      theme: 'none' // This setting means we have to manually add styles to all the components
      // preset: Aura
    }
  },
  echarts: {
    renderer: ['svg', 'canvas'],
    charts: ['BarChart', 'LineChart', 'GaugeChart', 'MapChart', 'ScatterChart', 'HeatmapChart'],
    features: ['LabelLayout', 'UniversalTransition'],
    components: ['TitleComponent', 'TooltipComponent', 'LegendComponent', 'DatasetComponent', 'GridComponent']
  }
});
