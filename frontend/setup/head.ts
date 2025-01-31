export default {
    title: 'LFX Insights',
    htmlAttrs: {
        lang: 'en', // Language of the website
    },
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Insights on opensource projects' },
        { hid: 'keywords', name: 'keywords', content: 'lfx, insights, opensource' },
        { hid: 'author', name: 'author', content: 'The Linux Foundation' },
        { hid: 'theme-color', name: 'theme-color', content: '#ffffff' }, // Browser theme color
        { hid: 'og:title', property: 'og:title', content: 'LFX Insights' },
        { hid: 'og:description', property: 'og:description', content: 'Insights on opensource projects' },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:image', property: 'og:image', content: '/favicon.ico' },
        { hid: 'og:url', property: 'og:url', content: 'https://insights.lfx.org' },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: 'LFX Insights' },
        { hid: 'twitter:description', name: 'twitter:description', content: 'Insights on opensource projects' },
        { hid: 'twitter:image', name: 'twitter:image', content: '/favicon.ico' }
    ],
    link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'},
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Slab:wght@400;600&display=swap'
        }
    ],
    script: [
        // Using fontawesome like this instead of installing plugins
        {src: 'https://kit.fontawesome.com/b5289aebdf.js'}
    ]
}
