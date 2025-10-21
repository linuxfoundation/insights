// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import "../app/assets/styles/main.scss";

// Setup PrimeVue globally for all stories
setup((app) => {
  app.use(PrimeVue, { theme: 'none' });
  app.use(ToastService);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div><story /></div>',
    }),
  ],
};

export default preview;
