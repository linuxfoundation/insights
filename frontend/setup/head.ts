const title = 'LFX Insights – Data-Driven Collaboration for Open Source Projects';
const description = 'LFX Insights helps open-source teams track contributor activity, analyze trends, and '
    + 'enhance collaboration. Get real-time insights into your project\'s development, security, and popularity.';
const keywords = 'LFX Insights, open source analytics, contributor tracking, software security, '
    + 'project collaboration, developer insights, Linux Foundation'

const shortDescription = 'Track contributor activity, analyze trends, and boost collaboration with real-time '
    + 'insights for open-source projects.'

export default {
    title,
    htmlAttrs: {
        lang: 'en', // Language of the website
    },
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
            hid: 'description',
            name: 'description',
            content: description
        },
        { hid: 'keywords', name: 'keywords', content: keywords },
        { hid: 'author', name: 'author', content: 'The Linux Foundation' },
        { hid: 'theme-color', name: 'theme-color', content: '#ffffff' }, // Browser theme color
        {
            hid: 'og:title',
            property: 'og:title',
            content: title
        },
        {
            hid: 'og:description',
            property: 'og:description',
            content: shortDescription
        },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:image', property: 'og:image', content: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' },
        { hid: 'og:url', property: 'og:url', content: 'https://insights.lfx.org' },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        {
            hid: 'twitter:title',
            name: 'twitter:title',
            content: title
        },
        {
            hid: 'twitter:description',
            name: 'twitter:description',
            content: shortDescription
        },
        { hid: 'twitter:image', name: 'twitter:image', content: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' }
    ],
    link: [
        { rel: 'icon', type: 'image/x-icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' },
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'},
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Slab:wght@400;600&display=swap'
        }
    ],
    script: [
        // Using fontawesome like this instead of installing plugins
        {src: 'https://kit.fontawesome.com/d65f54d9ea.js', crossorigin: 'anonymous'}
    ]
}
