import LfxIcon from "../icon/Icon.vue";
import LfxMenuButton from './menu-button.vue';

export default {
    components: {LfxIcon},
    title: 'LinuxFoundation/MenuButton',
    component: LfxMenuButton,
    tags: ['autodocs'],
    argTypes: {
        // Slots
        active: {
            description: 'If menu button is active',
            defaultValue: false,
            control: 'boolean',
        },
        to: {
            description: 'Router link to navigate to',
            defaultValue: undefined,
            control: {
                type: null,
            },
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
