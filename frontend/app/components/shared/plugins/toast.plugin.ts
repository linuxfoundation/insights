// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import ToastService from 'primevue/toastservice';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ToastService);
});
