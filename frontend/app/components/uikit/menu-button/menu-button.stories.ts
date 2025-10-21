// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxIcon from "../icon/icon.vue";
import LfxMenuButton from './menu-button.vue';

export default {
    components: {LfxIcon},
    title: 'LinuxFoundation/MenuButton',
    component: LfxMenuButton,
    tags: ['autodocs'],
    argTypes: {
        // Props
        active: {
            description: 'If menu button is active',
            defaultValue: false,
            control: 'boolean',
        },
        to: {
            description: 'Router link to navigate to (Vue Router route location)',
            defaultValue: undefined,
            control: {
                type: null,
            },
        },
        exact: {
            description: 'Use exact active class matching for router links',
            defaultValue: false,
            control: 'boolean',
        },
        disabled: {
            description: 'Whether the menu button is disabled',
            defaultValue: false,
            control: 'boolean',
        },

        // Slots
        default: {
            description: 'Text or html content of the button',
            control: {
                type: null,
            },
        },
    },
};

const render = (args) => ({
    components: {LfxMenuButton, LfxIcon},
    setup() { return { args }; },
    template: '<div class="flex">'
        + '<lfx-menu-button v-bind="args"><lfx-icon name="compass" />Explore</lfx-menu-button>'
        + '</div>',
});

export const Default = {
    args: {
        active: false,
    },
    render,
};

export const Active = {
    args: {
        active: true,
    },
    render,
};
