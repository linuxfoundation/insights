import Toast from "primevue/toast";
import LfxButton from "../button/button.vue";
import useToastService from "./toast.service";
import {toastTypes} from "./types/toast.types";

export default {
  title: "LinuxFoundation/Toast",
  tags: ["autodocs"],
  argTypes: {
    message: {
      description: "Message of the toast",
      control: "text",
    },
    toastType: {
      description: 'The type of the toast',
      control: 'select',
      options: toastTypes,
    },
    delay: {
      description: "Delay of the toast",
      control: "number",
    },
    icon: {
      description: "Delay of the toast",
      control: "string",
    },
  },
};

const render = (args) => ({
  components: { LfxButton, Toast }, // Include Toast component
  setup() {
    const { showToast } = useToastService();
    const displayToast = () => {
      showToast(args.message, args.toastType, args.icon, args.delay);
    };
    return { args, displayToast };
  },
  template: `
    <div>
      <Toast /> <!-- Ensure Toast is rendered -->
      <lfx-button @click="displayToast">Show Toast</lfx-button>
    </div>
  `,
});

export const Default = {
  args: {
    message: "This is a toast message",
    toastType: 'secondary',
    delay: 3000,
  },
  render,
};

export const Info = {
  args: {
    message: "This is a toast message",
    toastType: 'info',
    delay: 3000,
  },
  render,
};
