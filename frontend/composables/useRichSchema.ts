// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {
    defineWebSite,
    defineWebApplication,
    useSchemaOrg,
    useRuntimeConfig
} from '#imports';

export function useRichSchema() {
    const config = useRuntimeConfig();
    const baseUrl = config.public.appUrl;

    const addSitewideSchema = () => {
        useSchemaOrg([
            defineWebSite({
                name: 'LFX Insights',
                url: baseUrl,
            }),
            defineWebApplication({
                name: 'LFX Insights',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: baseUrl,
                offers: {
                    '@type': 'Offer',
                    price: 0,
                    priceCurrency: 'USD',
                },
            }),
        ]);
    };

    return {
        addSitewideSchema,
    };
}
