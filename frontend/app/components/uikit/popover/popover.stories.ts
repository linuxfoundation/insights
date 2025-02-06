import { ref } from 'vue';
import LfxButton from '../button/button.vue';
import LfxPopover from './popover.vue';

export default {
    title: 'LinuxFoundation/Popover',
    component: LfxPopover,
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
    args: {
        default: 'This is popover content',
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
    render: (args) => ({
        components: { LfxPopover, LfxButton },
        setup() {
            const op = ref();
            const toggle = (event: MouseEvent) => op.value.toggle(event);
            return { args, op, toggle };
        },
        template: '<div class="">'
            + '<lfx-button @click="toggle">Click me</lfx-button>'
            + '<lfx-popover ref="op">'
            + '<div class="p-10">This is popover content</div>'
            + '</lfx-popover>'
            + '</div>',
    }),
};
