import { reactive } from 'vue';
import { email, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import LfxInput from '../input/input.vue';
import LfxFieldMessages from './field-messages.vue';
import LfxField from './field.vue';

export default {
  title: 'LinuxFoundation/FieldMessages',
  component: LfxFieldMessages,
  tags: ['autodocs'],
  argTypes: {
    // Props
    validation: {
      description: 'Enter vuelidate validation',
      control: {
        type: null,
      },
    },
    errorMessages: {
      description: 'Specifies custom error messages',
      control: {
        type: 'object',
      },
    },

    // Slots
    icon: {
      description: 'Message icon',
      control: {
        type: null,
      },
    },
  },
};

export const Regular = {
  args: {
    errorMessages: { required: 'This field is required', email: 'Invalid email' },
  },
  render: (args) => ({
    components: { LfxField, LfxInput, LfxFieldMessages },
    setup() {
      const form = reactive({
        email: '',
      });

      const rules = {
        email: {
          required,
          email,
        },
      };

      const v = useVuelidate(rules, form);

      return { args, form, v };
    },
    template: `<lfx-field
        label-text="Email"
        :required="true"
    >
      <lfx-input
          v-model="form.email"
          placeholder="Email address"
          :invalid="v.email.$invalid && v.email.$dirty"
          @blur="v.email.$touch()"
      />
      <lfx-field-messages
          :validation="v.email"
          :error-messages="args.errorMessages"
      />
    </lfx-field>`,
  }),
};
