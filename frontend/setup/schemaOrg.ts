// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default {
    schemaOrg: {
        enabled: true, // Enable in all environments including development
        identity: {
            type: 'Organization',
            name: 'LFX Insights',
            url: 'https://insights.linuxfoundation.org',
            logo: 'https://insights.linuxfoundation.org/logo.svg',
            parentOrganization: {
                '@type': 'Organization',
                name: 'The Linux Foundation',
                url: 'https://www.linuxfoundation.org/',
            },
            sameAs: [
                'https://www.linkedin.com/company/the-linux-foundation/',
                'https://x.com/linuxfoundation',
                'https://github.com/linuxfoundation',
            ],
        },
    }
}
