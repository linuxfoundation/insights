// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxCard from './card.vue';

export default {
    title: 'LinuxFoundation/Card',
    component: LfxCard,
    tags: ['autodocs'],
    argTypes: {
        // Slots
        default: {
            description: 'Text or html content of the button',
            control: {
                type: null,
            },
        },
    },
};

export const Default = {
    label: 'Primary',
    args: {
        default: 'This is card content',
    },
    parameters: {
        backgrounds: {
            default: 'lf-background',
            values: [
                {
                    name: 'lf-background',
                    value: '#f8f8f8',
                },
            ],
        },
    },
    render: () => ({
        components: { LfxCard },
        template: '<div class="flex"><lfx-card class="p-12">This is card content</lfx-card></div>',
    }),
};
