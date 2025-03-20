<template>
  <main class="min-h-screen flex flex-col">
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
    <div class="flex-grow" />
    <div class="container">
      <client-only>
        <lfx-footer class="pt-10 md:pt-16 pb-5 md:pb-8 px-0" />
      </client-only>
    </div>
  </main>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {watch} from 'vue'
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
// Only import the UI core library on the client side
if (import.meta.client) {
  await import('@linuxfoundation/lfx-ui-core');
}

const route = useRoute();

watch(() => route.path, () => {
  document.body.scrollTo(0, 0);
});
</script>

<style lang="scss" scoped>
.copyright {
  color: #808b91;
  a{
    color: #5b6367;

    &:hover{
      @apply underline;
    }
  }
}
</style>
