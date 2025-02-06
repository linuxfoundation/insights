import ToastService from 'primevue/toastservice';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ToastService);
});
